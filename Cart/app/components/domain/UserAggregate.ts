import type { Event } from '@event-driven-io/emmett';
import type { UserAggregateEvents } from '@/app/core/events/UserAggregate/UserAggregateEvents';

export type UserAggregate = {

    
}

export const initialState = (): UserAggregate => {
    return {
        
    };
}

export const mapToStreamId = (id: string) => {
    return `UserAggregate-${id}`;
}

export const evolve = (state: UserAggregate, _eventData: UserAggregateEvents): UserAggregate => {
    const {type, data} = _eventData;
    switch(type) {
        
		default: return state
    }
}
