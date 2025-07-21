import {useEffect, useState} from "react"
import Form from 'rjsf-bulma';

import validator from '@rjsf/validator-ajv8';
import {commandSchema} from "@/app/prototype/components/commands";
import {RJSFValidationError} from "@rjsf/utils";

var util = require('util');

export const JsonForm = (props: {
    slice: string,
    command: string,
    formData: any,
    submit: (data: FormData, errors: RJSFValidationError[]) => void
}) => {
    const [data, setData] = useState<{}>()
    const [schema, setSchema] = useState<string>()
    useEffect(() => {
        commandSchema(props.slice, props.command).then((schema) => setSchema(schema))
    }, [props.command]);

    return <div className={"top-margin"}>
        {/*onSubmit={(data:any)=>props.handleCommand({data:{...data.formData}})*/}
        {schema ? <Form formData={props.formData ? props.formData : undefined}
                        schema={schema}
                        validator={validator}
                        onChange={(data) => setData(data.formData)}
                        onSubmit={(data) => props.submit(data.formData, data.errors)}/>
            : <span/>}
    </div>
}
