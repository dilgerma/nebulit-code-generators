"use client"
import React from 'react';
import {useEffect, useState} from "react"
import {ViewSelection} from '@/app/core/types';





export default function SliceViews(props: {views?: ViewSelection[] }) {

    const [selectedView, setSelectedView] = useState<ViewSelection|null>()

    return (

        <div className={"columns"}>
            <div className={"column is-4"}>
            <select value={selectedView?.viewName??""} onChange={(evt) => {
                        //@ts-ignore
                        setSelectedView(props.views?.find(it => it.viewName == evt.target.value))
                    }} className="select">
                        <option value="">Bitte auswählen</option>

                        {props?.views?.map((viewSelection: ViewSelection, idx: number) => {
                            return <option value={viewSelection.viewName} key={idx}>{viewSelection?.viewName}</option>
                        })}
                    </select>
                    <div>
                        {selectedView?.view ? React.createElement(selectedView?.view) : <span/>}

                    </div>
            </div>

        </div>

    );
}


