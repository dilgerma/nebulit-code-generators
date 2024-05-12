import {initialState, loadFromStream} from '@/app/components/slices/inventory/<%-_readModelName%>';
import {Processor} from '@/app/core/types';
import {
    <%-_commandName%>,
    handle<%-_commandName%>
} from '@/app/components/slices/<%-_slice%>/<%-_commandName%>';



interface <%-_processorName%> extends Processor {
    <%-_processorFields%>
}

let processor:<%-_processorName%> = {

    <%-_processorFieldDefaults%>


    process: async ()=>{
        let readModel = await loadFromStream(    <%-_streamName%>, initialState())

        var command:<%-_commandName%> = {
            type:"<%-_commandName%>",
            data: {
                <$-_commandFieldAssignmentsFromReadModel%>
            }
        }

        await handle<%-_commandName%>(command)
    }
}
