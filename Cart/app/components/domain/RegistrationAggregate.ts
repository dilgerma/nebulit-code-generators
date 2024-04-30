import type { Event } from '@event-driven-io/emmett';
import type { RegistrationAggregateEvents } from '@/app/core/events/RegistrationAggregate/RegistrationAggregateEvents';

export type RegistrationAggregate = {

    
}

export const initialState = (): RegistrationAggregate => {
    return {
        
    };
}

export const mapToStreamId = (id: string) => {
    return `RegistrationAggregate-${id}`;
}

export const evolve = (state: RegistrationAggregate, _eventData: RegistrationAggregateEvents): RegistrationAggregate => {
    const {type, data} = _eventData;
    switch(type) {
        
		default: return state
    }
}
