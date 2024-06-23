import {useEffect, useState} from "react"
import {JsonForm} from '@/app/components/commandselection/JsonForm';
import {CommandConfig} from '@/app/core/types'

export const CommandSelection = (props:{commands:CommandConfig[]}) => {
    const [selectedCommandConfig, setSelectedCommand] = useState<CommandConfig|undefined>()



    return <div>

        <div className={"fixed-grid"}>
        <div className="grid">
            {props.commands.map((command: CommandConfig, idx: number) => {
                 return <div className={"cell command"} key={idx}
                 onClick={()=> setSelectedCommand(props.commands?.find(it => it.command == command.command))}>
                     <h3>Command</h3>
                     <div>
                     {command?.command}</div>
                <div className={"cell"}/>
                 </div>
             })}
        </div>
        </div>

        <div>
            {selectedCommandConfig ? <JsonForm schema={selectedCommandConfig.schema} handleCommand={selectedCommandConfig?.handler}/> : <span/>}
        </div>
    </div>
}
