import type { Event } from '@event-driven-io/emmett';

export type InventoryChangedEvent = Event<
    'InventoryChangedEvent',
    {
		aggregateId:string
		quantity:number
    }
>;
