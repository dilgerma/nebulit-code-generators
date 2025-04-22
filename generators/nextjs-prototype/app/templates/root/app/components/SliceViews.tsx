"use client"
import React from 'react';
import {useEffect, useState} from "react"
import {ViewSelection} from '@/app/core/types';

type FlowStep = {
    "slice": string,
    "sliceSlug": string,
    "step": number
}

type FlowData = {
    "name": string,
    "description": string,
    "slices": FlowStep[]
}

type FlowSliceView = {
    "step": number,
    "view": ViewSelection
}

export default function SliceViews(props: { aggregateId: string | undefined, views?: ViewSelection[] }) {

    const [selectedView, setSelectedView] = useState<ViewSelection | null>()
    const [filter, setFilter] = useState<RegExp>()
    const [flows, setFlows] = useState<FlowData[]>([])
    const [flow, setFlow] = useState<FlowData>()
    const [currentFlowStep, setCurrentFlowStep] = useState(0)
    const [playMode, setPlayMode] = useState<boolean>(false)
    const [flowViews, setFlowViews] = useState<FlowSliceView[]>([])

    useEffect(() => {
        if (!flow) {
            setPlayMode(false)
            setSelectedView(null)
            setCurrentFlowStep(0)
        }
    }, [flow]);

    useEffect(() => {
        setFlows(
            <%-_flows %>
        )
    }, []);

    const nextFlowStep = () => {
        if (!playMode) return
        if (currentFlowStep <= flowViews?.length - 1) {
            setSelectedView(flowViews[currentFlowStep+1].view)
            setCurrentFlowStep(currentFlowStep + 1)
        }
    }
    const previousFlowStep = () => {
        if (!playMode) return

        if (currentFlowStep > 0) {
            setSelectedView(flowViews[currentFlowStep-1].view)
            setCurrentFlowStep(currentFlowStep - 1)
        }
    }


    const viewToRender = (): React.FC<any> | undefined => {
        return selectedView?.commandView
    }
    return (
        <div>
            <div className={"columns"}>
                <div className={"column"}>
                    <label>
                        Filter:
                        <div className={"control filter"}>
                            <input
                                onChange={(evt) => setFilter(evt.target.value ? new RegExp(evt.target.value, 'i') : undefined)}
                                type={"text"} className={"input"}/>
                        </div>
                        Flows:
                        <div className={"control filter"}>
                            <select
                                value={flow?.name ?? ""}
                                onChange={(evt) => {
                                    setFlow(flows.find((flowElement) => evt.target.value == flowElement.name))
                                }}
                                className={"select"}>
                                <option>Bitte wählen</option>
                                {flows?.map((flowElememt) => {
                                    return <option
                                        selected={flow?.name == flowElememt?.name}>{flowElememt?.name}</option>
                                })}
                            </select>
                            <div className={"top-margin"}/>
                            {flow ? <div onClick={() => {
                                    setPlayMode(!playMode);
                                    setCurrentFlowStep(0);

                                    var viewsForFlow = props.views?.filter(propsView => flow.slices.map(it => it.sliceSlug).includes(propsView.slice)) ?? []

                                    var flowViews: FlowSliceView[] = viewsForFlow.map(view => {
                                        return {
                                            view: view,
                                            step: flow.slices.find(it => it.sliceSlug === view.slice)?.step ?? -1
                                        }
                                    })
                                    setFlowViews(flowViews.sort((a, b) => a.step - b.step))
                                    setSelectedView(flowViews[0].view)

                                }}
                                         className={!playMode ? "button is-info" : "button is-danger"}>{!playMode ? "Flow starten" : "Flow stoppen"}</div> :
                                <span/>}
                            <span className={"left-margin"}/>

                            {playMode ? <div onClick={() => previousFlowStep()}
                                             className={!playMode ? "button is-info" : "button"}><i
                                className="fa-solid fa-backward"></i></div> : <span/>}

                            {playMode ?
                                <div onClick={() => nextFlowStep()} className={!playMode ? "button is-info" : "button"}>
                                    <i className="fa-solid fa-forward"></i></div> : <span/>}
                            {playMode ?
                                <div>Schritt {currentFlowStep + 1} von {flowViews?.length} | <b>{flowViews[currentFlowStep].view.slice}</b>
                                </div> : <span/>}
                            <div>{flow?.description}</div>
                        </div>
                    </label>
                </div>
                <div className={"column is-8"}/>
            </div>
            {!playMode ?
                <div className="tabs">

                    <ul>
                        {props?.views?.filter(view => !filter || filter.test(view.viewName)).map((viewSelection) => <li
                            className={selectedView?.viewName == viewSelection.viewName ? "view is-active" : "view"}
                            onClick={() => {
                                setSelectedView(props.views?.find(it => it.viewName == viewSelection.viewName))
                            }}>
                            <a>
                                <div className={"has-text-centered"}>
                                    <img className={"shadow"} src={"https://i.ibb.co/87MRc1f/image.png"}/>
                                    <h3>{viewSelection.viewType}</h3>
                                    <div>{viewSelection.slice}</div>
                                </div>
                            </a>
                        </li>)}
                    </ul>
                </div> : <div>

                </div>}

            {
                viewToRender() ? React.createElement(viewToRender()!!, {aggregateId: props?.aggregateId}) : <span/>
            }
        </div>

    )
        ;
}


