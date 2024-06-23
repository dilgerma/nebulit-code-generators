"use client"
import {useState, useEffect} from "react";
import Draggable from "react-draggable";
import {debugAllStreams, findEventStore} from "../../core/infrastructure/inmemoryEventstore";
import {EventEnvelope} from "@event-driven-io/emmett";
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
    const [events, setEvents] = useState<{ [k: string]: EventEnvelope[] }>({})
    const [stream, setStream] = useState<string | undefined>("")
    const [currentUUID, setCurrentUUID] = useState<string>()

    useEffect(() => {
        const timer = setInterval((cartItems) => {
            setEvents(Object.fromEntries(debugAllStreams()))
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    return <Draggable>
        <div className={"debug"}>
            <div>
                <input checked={showEvents} className={"checkbox"} type={"checkbox"}
                       onChange={() => setShowEvents(!showEvents)}/>
                <div id={"uuid"}>{currentUUID}</div>
                <button onClick={() => setCurrentUUID(v4())} className={"button"}>UUID</button>
                <div onClick={() => CopyToClipboard("uuid")} className={"button"}><i className="fa-regular fa-copy"></i></div>
            </div>
            <hr/>
            <div>
                <select onChange={(evt) => {
                    setStream(evt.target.value)
                }} className={"select"}>
                    <option value={""}>Bitte wählen</option>
                    {Object.keys(events).map((item) => {
                        return <option value={item}>{item}</option>
                    })}
                </select>
            </div>

            {showEvents && stream ?

                <div>
                    {events[stream]?.map((item) => {
                        return <div>
                            <h3 className={"has-text-centered padding"}>{item.event.type}</h3>
                            <pre>
                                                                               {JSON.stringify(item.event.data, (key, value) =>
                                                                                       typeof value === 'bigint'
                                                                                           ? value.toString()
                                                                                           : value
                                                                                   , 2)}
                                <details>
                                    <summary>Metadaten</summary>
                                    {JSON.stringify(item.metadata, (key, value) =>
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
