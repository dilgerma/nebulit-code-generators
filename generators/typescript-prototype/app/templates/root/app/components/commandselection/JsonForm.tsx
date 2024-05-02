import Form from "@rjsf/core"
import {useState} from "react"
import {RJSFSchema} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
var util = require('util');

export const JsonForm = (props: any) => {
    const [data, setData] = useState<{}>()
    return <div>
        <Form schema={props.schema} validator={validator} onChange={(data) => setData(data.formData)} onSubmit={(data:any)=>props.handleCommand({data:{...data.formData}})}/>
        <div>
            {util.inspect(data)}
        </div>
    </div>
}
