import type { Event } from '@event-driven-io/emmett';

export type ProductRevokedEvent = Event<
    'ProductRevokedEvent',
    {
		productId:string
		aggregateId:string
    }
>;
