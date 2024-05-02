import type { Event } from '@event-driven-io/emmett';
import type { <%-_aggregateName%>Events } from '@/app/core/events/<%-_aggregateName%>/<%-_aggregateName%>Events';

export type <%-_aggregateName%> = {

<%-_fields%>
}

export const initialState = (): <%-_aggregateName%> => {
    return {
        <%-_fieldDefaults%>
    };
}

export const mapToStreamId = (id: string) => {
    return `<%-_aggregateName%>-${id}`;
}

export const evolve = (state: <%-_aggregateName%>, _eventData: <%-_aggregateName%>Events): <%-_aggregateName%> => {
    const {type, data} = _eventData;
    <%-_switchStatement%>
}
