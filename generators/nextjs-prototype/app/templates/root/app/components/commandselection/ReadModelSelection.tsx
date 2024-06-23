import React, {useState} from "react"
import {ReadModelConfig} from '@/app/core/types'

const serviceURI:string = "http://localhost:8080"

export const ReadModelSelection = (props:{aggregateId:string, readModels:ReadModelConfig[]}) => {
    const [selectedReadModelConfig, setSelectedReadModelConfig] = useState<ReadModelConfig|undefined>()



    return <div>

        <div className={"fixed-grid"}>
        <div className="grid">
            {props.readModels.map((readmodel: ReadModelConfig, idx: number) => {
                 return <div className={"cell readmodel"} key={idx}
                 onClick={()=> setSelectedReadModelConfig(props.readModels?.find(it => it.readModel == readmodel.readModel))}>
                     <h3>ReadModel</h3>
                     <div>
                     {readmodel?.readModel}</div>
                <div className={"cell"}/>
                 </div>
             })}
        </div>
        </div>

        <div>
            {selectedReadModelConfig ? React.createElement(selectedReadModelConfig.readModelView,
                {endpoint:selectedReadModelConfig.endpoint, aggregateId: props.aggregateId}) : <span/>}
        </div>
    </div>
}
