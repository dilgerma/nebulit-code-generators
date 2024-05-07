import type { Event } from '@event-driven-io/emmett';
<%-_aggregateEventImports%>

export type <%-_readModelName%> = {

<%-_fields%>
}

export const initialState = (): <%-_readModelName%> => {
    return {
        <%-_fieldDefaults%>
    };
}

export const evolve = (state: <%-_readModelName%>, _eventData: <%=_aggregateEvents%>): <%-_readModelName%> => {
    const {type, data} = _eventData;
    <%-_switchStatement%>
}
