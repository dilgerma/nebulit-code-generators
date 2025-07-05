import {useState} from "react"
import DataTable from "@/app/components/readmodel/DataTable";

export const <%-readmodel%>StateView = (props: {id: string}) => {
    const endpoint = "/api/<%-endpoint%>"
    const [errorMode, setErrorMode] = useState(false)
    const [error, setError] = useState("")


    return <div>

        <h3><%-readmodel%> StateView</h3>
        <div>
            <DataTable endpoint={endpoint} aggregateId={props.id}/>
        </div>
    </div>
}