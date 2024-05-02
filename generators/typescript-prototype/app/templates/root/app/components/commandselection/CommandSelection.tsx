import {useEffect, useState} from "react"
import {JsonForm} from '@/app/components/commandselection/JsonForm';

export const CommandSelection = (props: any) => {
    const [selectedCommand, setSelectedCommand] = useState<string|null>(null)
    const [selectedSchema, setSelectedSchema] = useState<string|null>(null)

    useEffect(() => {
        if(selectedCommand) {
            let schema = import(`./../slices/${selectedCommand}.json`).then((schema) => {
                setSelectedSchema(schema)
            })
        }
    }, [selectedCommand]);

    return <div>
        <select value={selectedCommand??""} onChange={(evt) => {
            //@ts-ignore
            setSelectedCommand(evt.target.value)
        }} className="select">
            <option value="">Bitte auswählen</option>

            {props.commands.map((command: string, idx: number) => {
                return <option value={command} key={idx}>{command}</option>
            })}
        </select>
        <div>
            {selectedSchema ? <JsonForm schema={selectedSchema}/> : <span/>}
        </div>
    </div>
}
