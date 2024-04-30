import type { Event } from '@event-driven-io/emmett';

export type CartSubmittedEvent = Event<
    'CartSubmittedEvent',
    {
		aggregateId:string
		totalPrice:number
		cartItems:string
    }
>;
