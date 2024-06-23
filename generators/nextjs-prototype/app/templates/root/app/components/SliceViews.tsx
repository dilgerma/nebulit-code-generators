"use client"
import React from 'react';
import {useEffect, useState} from "react"
import {ViewSelection} from '@/app/core/types';


export default function SliceViews(props: { aggregateId:string|undefined, views?: ViewSelection[]}) {

    const [selectedView, setSelectedView] = useState<ViewSelection>()


    const viewToRender = (): React.FC<any> | undefined => {
        return selectedView?.commandView
    }
    return (
        <div>
            <div className="tabs">
                <ul>
                    <li>Screens:</li>
                    {props?.views?.map((viewSelection) => <li
                        className={selectedView?.viewName == viewSelection.viewName ? "view is-active" : "view"}
                        onClick={() => {
                            setSelectedView(props.views?.find(it => it.viewName == viewSelection.viewName))
                        }}>
                        <a>
                            <div>
                                <div><b>{viewSelection.slice}</b></div>
                                <div>{viewSelection.viewName}</div>
                            </div>
                        </a>
                    </li>)}
                </ul>
            </div>

            {
                viewToRender() ? React.createElement(viewToRender()!!,{aggregateId: props?.aggregateId}) : <span/>
            }
        </div>

    )
        ;
}


