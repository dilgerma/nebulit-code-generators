import {AppCommand} from "@/app/prototype/components/commands";
<%-eventsImports%>
import {AppEvent} from "@/app/prototype/components/events";
import {debugAllStreams, findEventStore} from "@/app/prototype/infrastructure/inmemoryEventstore";
import {Event} from "@event-driven-io/emmett"
import {CommandResult} from "@/app/prototype/components/commands";

const streamIds:string[] = [<%-aggregates%>]

export type <%=name%> = AppCommand<
    '<%=name%>',
    {
<%=fields%>
    }
>;

export const checkCommand = () => {
    let streams = debugAllStreams();
    // provide the initial data, in case we have configured events
    let initialValue = handleDecision([])
    var initial = {events: initialValue.events, enabled:<%-initialValue%>}
    var result = Array.from(streams.keys()).map((key) => {
        if (streamIds.includes(key)) {
            const stream = streams.get(key);
            const events = stream ? stream.map(it => it.event) : [];
            return handleDecision(events);
        } else {
            return {events: [], enabled: true}
        }
    }).reduce((previous, current) => ({
        enabled: current.enabled,
        events: [...previous.events, ...current.events]
    }),  initial);

    return result
};

const handleDecision = (events: Event[]): CommandResult => {
    let result: CommandResult = {events: [] = [], enabled: true}
        try {
            <%-projection%>
        } catch (e) {
            alert("Error handling command: <%-name%>")
        }
    return result
}

export const handle =(data: any):AppEvent[] => {
    var command:<%=name%> =  {
        type: '<%=name%>',
        data: {...data},
        metadata: {
            slice: "<%=slice%>",
            aggregate: "<%=aggregate%>",
            now: new Date()
        }
    }
    var events = decide(command)
    if(events.length > 0) {
        findEventStore().appendToStream(`<%=aggregate%>`, events)
    }
    return events
}

export const decide = (command: <%=name%>): AppEvent[] => {

    var result = checkCommand()
	return result.enabled ? [
<%-events%>
	].filter((event)=>!result.events || result.events.length == 0 || result.events.includes(event.type)) : []
}