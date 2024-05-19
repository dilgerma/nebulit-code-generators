<%-_readModelsImports%>
import {Processor} from '@/app/core/types';
<%-_cartAggregateHandlerImports%>



interface <!%-_processorName%> extends Processor {
    <!%-_processorFields%>
}

let processor:<!%-_processorName%> = {

    <!%-_processorFieldDefaults%>


    process: async ()=>{
        let readModel = await loadFromStream(    <!%-_streamName%>, initialState())

        var command:<!%-_commandName%> = {
            type:"<!%-_commandName%>",
            data: {
                <$-_commandFieldAssignmentsFromReadModel%>
            }
        }

        await handle<!%-_commandName%>(command)
    }
}
