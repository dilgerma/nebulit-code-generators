import {useState} from "react"
import Form from 'rjsf-bulma';
import validator from '@rjsf/validator-ajv8';

export const JsonForm = (props: any) => {
    const [data, setData] = useState<{}>()
    return <div className={"top-margin"}>
        <Form formData={props.formData ?  props.formData : undefined} schema={props.schema} validator={validator} onChange={(data) => setData(data.formData)} onSubmit={(data:any)=>props.handleCommand({data:{...data.formData}})}/>
    </div>
}
