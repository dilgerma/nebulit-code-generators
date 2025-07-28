import {useState} from "react"
import DataTable from "../../../components/readmodel/DataTable";
//import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const <%-readmodel%>StateView = () => {
    const endpoint = "<%-endpoint%>-collection"
    const [errorMode, setErrorMode] = useState(false)
    const [error, setError] = useState("")
    const [showFilter, setShowFilter] = useState(<%-showFilter%>)
    const [id, setId] = useState("")

    return <div>

        <h3><%-readmodel%> StateView</h3>
        {showFilter ? <div className="controls">
            <input onChange={(evt)=>{setId(evt.target.value)}} type="text" placeholder="Id" className="input"/>
        </div> : <span/> }
        <div className={"top-margin"}/>

        <div>
            <DataTable endpoint={endpoint} queries={<%-query%>}/>
        </div>
    </div>
}