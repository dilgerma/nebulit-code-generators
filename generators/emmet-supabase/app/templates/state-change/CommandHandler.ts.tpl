import type {Command} from '@event-driven-io/emmett'
import {CommandHandler} from '@event-driven-io/emmett';
import {ContextEvents} from "../../events/ContextEvents";
import {findEventstore} from "../../common/loadPostgresEventstore";

export type <%=commandName%>Command = Command<'<%=commandName%>', {
<% fields.forEach(function(field, index) { %>    <%=field.name%>: <%=typeMapping(field.type, field.cardinality)%><% if (index < fields.length - 1) { %>,<% } %>
<% }); %>},
    {
        correlation_id?: string,
        causation_id?: string,
        now?: Date,
        streamName?: string,
    }>;

export type <%=commandName%>State = {
    // Add state fields needed for validation
    // Use empty {} if no validation needed
}

export const <%=commandName%>InitialState = (): <%=commandName%>State => ({
    // Initialize state
});

export const evolve = (
    state: <%=commandName%>State,
    event: ContextEvents,
): <%=commandName%>State => {
    const {type, data} = event;

    switch (type) {
        case "<%=eventName%>":
            // Update state based on event
            return state;
        default:
            return state;
    }
};

export const decide = (
    command: <%=commandName%>Command,
    state: <%=commandName%>State,
): ContextEvents[] => {
    // Add business logic validation here
    // Throw errors if validation fails

    return [{
        type: '<%=eventName%>',
        data: {
<% fields.forEach(function(field, index) { %>            <%=field.name%>: command.data.<%=field.name%><% if (index < fields.length - 1) { %>,<% } %>
<% }); %>        },
        metadata: {
            correlation_id: command.metadata?.correlation_id,
            causation_id: command.metadata?.causation_id,
        }
    }];
};

const <%=commandName%>CommandHandler = CommandHandler<<%=commandName%>State, ContextEvents>({
    evolve,
    initialState: <%=commandName%>InitialState
});

export const handle<%=commandName%> = async (id: string, command: <%=commandName%>Command) => {
    const eventStore = await findEventstore()
    const result = await <%=commandName%>CommandHandler(eventStore, id, (state: <%=commandName%>State) => decide(command, state))
    return {
        nextExpectedStreamVersion: result.nextExpectedStreamVersion,
        lastEventGlobalPosition: result.lastEventGlobalPosition
    }
}
