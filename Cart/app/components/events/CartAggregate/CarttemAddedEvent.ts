import type { Event } from '@event-driven-io/emmett';

export type CarttemAddedEvent = Event<
    'CarttemAddedEvent',
    {
		productName:string
		price:number
		quantity:number
		productimage:string
		aggregateId:string
		cartItemId:string
		productId:string
    }
>;
