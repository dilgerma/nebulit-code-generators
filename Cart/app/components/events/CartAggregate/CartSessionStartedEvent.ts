import type { Event } from '@event-driven-io/emmett';

export type CartSessionStartedEvent = Event<
    'CartSessionStartedEvent',
    {
		aggregateId:string
    }
>;
