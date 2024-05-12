import type { Event, ReadStreamResult } from '@event-driven-io/emmett';
import {findEventStore} from '@/app/core/infrastructure/inmemoryEventstore';
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

<%-_loadFromStream%>
