import type { Event } from '@event-driven-io/emmett';

export type PriceChangedEvent = Event<
    'PriceChangedEvent',
    {
		oldPrice:number
		newPrice:number
		aggregateId:string
    }
>;
