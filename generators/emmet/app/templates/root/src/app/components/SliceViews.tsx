"use client"
import React from 'react';
import {useEffect, useState} from "react"
import {ViewSelection} from '@/app/core/types';

function shorten(text:string, length = 15)  {
    if (!text || text.length <= length) {
        return text;
    }
    return text.substring(0, length) + "...";
};

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
                    </label>
                </div>
                <div className={"column is-8"}/>
            </div>
            <div className="tabs">

                <ul>
                    {props?.views?.filter(view => !filter || filter.test(view.viewName)).map((viewSelection, idx) => <li
                        key={idx} className={selectedView?.viewName == viewSelection.viewName ? "view is-active" : "view"}
                        onClick={() => {
                            setSelectedView(props.views?.find(it => it.viewName == viewSelection.viewName))
                        }}>
                        <a>
                            <div className={"has-text-centered"}>
                                <img className={"shadow"} src={"https://i.ibb.co/87MRc1f/image.png"}/>
                                <h3>{viewSelection.viewType}</h3>
                                <div title={viewSelection.slice}>{shorten(viewSelection.slice,20)}</div>
                            </div>
                        </a>
                    </li>)}
                </ul>

            </div>

            {
                viewToRender() ? React.createElement(viewToRender()!!, {aggregateId: props?.aggregateId}) : <span/>
            }
        </div>

    )
        ;
}


