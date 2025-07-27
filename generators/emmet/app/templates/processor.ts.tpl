import {ProcessorConfig, startProcessor} from "../../process/process";
import {<%-readmodel%>ReadModel} from "../<%-readmodel%>/<%-readmodel%>Projection";
import {handle<%-command%>, <%-command%>Command} from "./<%-command%>Command";

const config: ProcessorConfig = {
    schedule: '*/30 * * * * *',
    endpoint: "<%-readmodel%>-collection"
}

const idAttribute = "<%-idAttribute%>"


export const processor = {
    start: () => {
        startProcessor(config, async (item: <%-readmodel%>ReadModel) => {
            console.log(`Processing ${JSON.stringify(item)} from List ${config.endpoint}`);
            const command: <%-command%>Command = {
                type: "<%-command%>",
                data: {
                   <%-assignments%>
                },metadata: {}
            }

            const id =  command.data[idAttribute]

            if (!id) {
                throw `Cannot process Command ${command.type}. No Id available.`
            }
            await handle<%-command%>(id, command)
        })
    }
}
