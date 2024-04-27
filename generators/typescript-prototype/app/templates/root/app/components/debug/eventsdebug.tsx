"use client"
import {useState, useEffect} from "react";
import Draggable from "react-draggable";
import {debugAllStreams, findEventStore} from "../../core/infrastructure/inmemoryEventstore";
import {EventEnvelope } from "@event-driven-io/emmett";

export function DebugEvents(props: any) {

    //Map<string, EventEnvelope[]>
    var [showEvents, setShowEvents] = useState(false)
    const [events, setEvents] = useState<{ [k:string]:EventEnvelope[]} >({})
    const [stream, setStream] = useState<string | undefined>("")

    useEffect(() => {
        const timer = setInterval((cartItems) => {
            setEvents(Object.fromEntries(debugAllStreams()))
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    return <Draggable>
        <div className={"debug"}>
            <input type={"checkbox"} onChange={() => setShowEvents(!showEvents)}/><label
            className={"label"}>Debug</label>
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

                        </pre></div>
                    })}


                </div> : <span/>}
        </div>
    </Draggable>
}
