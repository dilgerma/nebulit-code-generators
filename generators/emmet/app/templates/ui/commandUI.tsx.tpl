import {useState} from "react"
import {JsonForm} from "@/app/components/commandselection/JsonForm";
import schema from './<%-command%>.json'
import {parseEndpoint} from "@/app/components/util/parseEndpoint";

export const <%-command%>Component = () => {
    const endpoint = "/api/<%-endpoint%>"
    const idAttribute = "<%-idAttribute%>"
    const [errorMode, setErrorMode] = useState(false)
    const [error, setError] = useState("")
    return <div>

        {errorMode ? <div className={"notification is-danger"}>Error in Command-Processing<br/>{error}</div> :
            <span/>}

        <h3><%-command%></h3>
        <div>
            <JsonForm schema={schema} handleCommand={(command: any) => {
                setErrorMode(false)
                fetch(parseEndpoint(`${endpoint}/${command?.data[idAttribute]}`, command.data), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(command)
                })
                    .catch((error: any) => {
                        setErrorMode(true);
                        setErrorMode(error)
                    });
            }}/>
        </div>
    </div>
}