import type { Event } from '@event-driven-io/emmett';

export type ProductRevocationRequestedEvent = Event<
    'ProductRevocationRequestedEvent',
    {
		productId:string
		aggregateId:string
    }
>;
