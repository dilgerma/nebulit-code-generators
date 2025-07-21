"use client"
import {useEffect, useState} from "react";
import Draggable from "react-draggable";
import {v4} from "uuid"

function CopyToClipboard(id: any) {
    //@ts-ignore
    var r = document.createRange();
    //@ts-ignore
    r.selectNode(document.getElementById(id));
    //@ts-ignore
    window.getSelection().removeAllRanges();
    //@ts-ignore
    window.getSelection().addRange(r);
    //@ts-ignore
    document.execCommand('copy');
    //@ts-ignore
    window.getSelection().removeAllRanges();
}

export function DebugEvents(props: any) {

    //Map<string, EventEnvelope[]>
    var [showEvents, setShowEvents] = useState(true)
    const [events, setEvents] = useState<[]>([])
    const [stream, setStream] = useState<string | undefined>("")
    const [currentUUID, setCurrentUUID] = useState<string>()
    const [aggregateId, setAggregateId] = useState<string | undefined>()

    useEffect(() => {
        const timer = setInterval((cartItems) => {
            if (aggregateId && showEvents) {
                fetchEvents(aggregateId).then((events) => {
                    setEvents(events)
                })
            }
        }, 2000);
        return () => clearInterval(timer);
    }, [aggregateId, showEvents]);

    function applyAggregateId(aggregateId: string) {
        setAggregateId(aggregateId)
        if (props.applyAggregateIdFn)
            props?.applyAggregateIdFn(aggregateId)
    }

    return <Draggable>
        <div className={"debug padding"}>
            <label>
                <div>
                    <input checked={showEvents} className={"checkbox"} type={"checkbox"}
                           onChange={() => setShowEvents(!showEvents)}/>
                    <span className={"left-margin"}>Events anzeigen</span>
                </div>
            </label>
            <div id={"uuid"}>{currentUUID}</div>
            <button onClick={() => setCurrentUUID(v4())} className={"button"}>UUID</button>
            <div onClick={() => CopyToClipboard("uuid")} className={"button"}><i
                className="fa-regular fa-copy"></i>
            </div>

            <hr/>
            <div className={"control"}>
                <label>
                    <span>AggregateId:</span>
                    <input value={aggregateId} onChange={(evt) => applyAggregateId(evt.target.value)} type={"text"}
                           className={"input"}/>
                </label>
            </div>

            {showEvents ?

                <div>
                    {events?.map((item) => {
                        <h3 className={"has-text-centered padding"}>{item.type}</h3>
                        return <div>
                            <div>
                                <b>Sequence:</b><span>{item.sequenceNumber}</span></div>
                            <div><b>Type:</b><span>{item.payloadType}</span></div>
                            <pre>
                                                                               {JSON.stringify(item.payload, (key, value) =>
                                                                                       typeof value === 'bigint'
                                                                                           ? value.toString()
                                                                                           : value
                                                                                   , 2)}
                                <details>
                                    <summary>Metadaten</summary>
                                    {JSON.stringify(item.metaData, (key, value) =>
                                            typeof value === 'bigint'
                                                ? value.toString()
                                                : value
                                        , 2)}
                                </details>

                        </pre>
                        </div>
                    })}


                </div> : <span/>}
        </div>
    </Draggable>


}

async function fetchEvents(aggregateId: string) {
    try {
        const response = await fetch(`http://localhost:8080/internal/debug/events/${aggregateId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // This will be a list of objects
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}
