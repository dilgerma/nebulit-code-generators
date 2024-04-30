import type { Event } from '@event-driven-io/emmett';

export type CartItemRemovedEvent = Event<
    'CartItemRemovedEvent',
    {
		aggregateId:string
		cartItemId:string
    }
>;
