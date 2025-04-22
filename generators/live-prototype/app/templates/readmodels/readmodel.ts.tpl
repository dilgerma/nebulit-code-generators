import {Event, EventEnvelope} from "@event-driven-io/emmett";
import {debugAllStreams} from "@/app/prototype/infrastructure/inmemoryEventstore";

const streamIds:string[] = [<%-aggregates%>]

const renderObject = (object)=>{
    return typeof object == "object" ? JSON.stringify(object, null, 2) : object;
}

export class <%=name%> {


    resultList: any[] = []
    result:any = <%- initialValue %>

    handle(events: Event[]) {
        try {
        <%-projection%>
        } catch(e) {
            alert("Problem with the script in <%= name%> - Error: " + e)
        }
    }
}

export const resolve = ():<%=name%> => {
    var streams = debugAllStreams();
    var rm = new <%=name%>()
    streams.keys().forEach((key,idx:number)=>{
        if (streamIds.includes(key)) {
            var stream = streams.get(key)
            rm.handle(stream?.map(it=>it.event)||[])
        }
    })
    return rm
}