import {useEffect, useState} from "react"
import {JsonForm} from '@/app/components/commandselection/JsonForm';
import {CommandConfig} from '@/app/core/types'

export const CommandSelection = (props:{commands:CommandConfig[]}) => {
    const [selectedCommandConfig, setSelectedCommand] = useState<CommandConfig|null>(null)



    return <div>
        <select value={selectedCommandConfig?.command??""} onChange={(evt) => {
            //@ts-ignore
            setSelectedCommand(props.commands?.find(it => it.command == evt.target.value))
        }} className="select">
            <option value="">Bitte auswählen</option>

            {props.commands.map((command: CommandConfig, idx: number) => {
                return <option value={command.command} key={idx}>{command?.command}</option>
            })}
        </select>
        <div>
            {selectedCommandConfig ? <JsonForm schema={selectedCommandConfig.schema} handleCommand={selectedCommandConfig?.handler}/> : <span/>}
        </div>
    </div>
}
