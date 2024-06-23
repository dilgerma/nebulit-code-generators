"use client"
import React from 'react';
import {useEffect, useState} from "react"
import {ProcessorSelection, ViewSelection} from '@/app/core/types';


export default function SliceViews(props: { views?: ViewSelection[], processors?: ProcessorSelection[] }) {

    const [selectedView, setSelectedView] = useState<ViewSelection>()
    const [selectedProcessor, setSelectedProcessor] = useState<ProcessorSelection>()


    const viewToRender = (): React.FC<any> | undefined => {
        return selectedView ? selectedView.view : selectedProcessor?.view
    }
    return (
        <div>
            <div className="tabs">
                <ul>
                    <li>Screens:</li>
                    {props?.views?.map((viewSelection) => <li
                        className={selectedView?.viewName == viewSelection.viewName ? "view is-active" : "view"}
                        onClick={() => {
                            setSelectedProcessor(undefined)
                            setSelectedView(props.views?.find(it => it.viewName == viewSelection.viewName))}}>
                        <a>
                            <div>
                                <div><b>{viewSelection.slice}</b></div>
                                <div>{viewSelection.viewName}</div>
                            </div>
                        </a>
                    </li>)}
                </ul>
            </div>
            <div className="tabs">
                <ul>
                    <li>Processor:</li>

                    {props?.processors?.map((processorSelection) => <li
                        className={selectedProcessor?.processorName == processorSelection.processorName ? "processor is-active" : "processor"}
                        onClick={() => {
                            setSelectedView(undefined)
                            setSelectedProcessor(props.processors?.find(it => it.processorName == processorSelection.processorName))
                        }}>
                            <a>

                            <div>
                            <div><b>{processorSelection.slice}</b></div>
                            <div>{processorSelection.processorType}</div>
                        </div>
                        </a>
                        </li>)}
</ul>
</div>
{
    viewToRender() ? React.createElement(viewToRender()!!) : <span/>
}
</div>

)
;
}


