import type { Event } from '@event-driven-io/emmett';

export type CartClearedEvent = Event<
    'CartClearedEvent',
    {
		aggregateId:string
    }
>;
