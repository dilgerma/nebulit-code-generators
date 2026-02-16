import {ProcessorConfig, ProcessorTodoItem, startProcessor} from "../../process/process";
import {handle<%=commandName%>} from "./<%=commandName%>Command";

export type ItemToProcess = {
<% fields.forEach(function(field, index) { %>    <%=field.name%>: <%=typeMapping(field.type, field.cardinality)%>;
<% }); %>}

const config: ProcessorConfig = {
    schedule: "*/30 * * * * *", // Every 30 seconds (adjust as needed)
    endpoint: "<%=todoListEndpoint%>-collection", // Read model endpoint
    query: {
        "status": "OPEN",    // Filter criteria
        "_limit": "1"         // Process one at a time
    }
}

const handler = async (item: ItemToProcess & ProcessorTodoItem) => {
    console.log(`Processing item: ${item.id}`)

    try {
        await handle<%=commandName%>(`aggregate-${item.id}`, {
            type: "<%=commandName%>",
            data: {
<% fields.forEach(function(field, index) { %>                <%=field.name%>: item.<%=field.name%><% if (index < fields.length - 1) { %>,<% } %>
<% }); %>            },
            metadata: {}
        })

        console.log(`Successfully processed item: ${item.id}`)
    } catch (error) {
        console.error(`Error processing item ${item.id}:`, error)
    }
}

export const processor = {
    start: () => {
        console.log("[<%=commandName%>Processor] Starting processor...")
        startProcessor<ItemToProcess>(config, handler)
    }
}
