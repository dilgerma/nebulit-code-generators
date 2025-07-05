import {useState} from "react"
import DataTable from "@/app/components/readmodel/DataTable";

export const <%-readmodel%>StateView = () => {
    const endpoint = "/api/<%-endpoint%>"
    const [errorMode, setErrorMode] = useState(false)
    const [error, setError] = useState("")

    const [id, setId] = useState("")

    return <div>

        <h3><%-readmodel%> StateView</h3>
        <div className="controls">
            <input onChange={(evt)=>{setId(evt.target.value)}} type="text" placeholder="Id" className="input"/>
        </div>
        <div className={"top-margin"}/>

        <div>
            <DataTable endpoint={endpoint} aggregateId={id}/>
        </div>
    </div>
}