import type { Event } from '@event-driven-io/emmett';
import type { ProductInventoryAggregateEvents } from '@/app/core/events/ProductInventoryAggregate/ProductInventoryAggregateEvents';

export type ProductInventoryAggregate = {

    		aggregateId:string
}

export const initialState = (): ProductInventoryAggregate => {
    return {
        		aggregateId:""
    };
}

export const mapToStreamId = (id: string) => {
    return `ProductInventoryAggregate-${id}`;
}

export const evolve = (state: ProductInventoryAggregate, _eventData: ProductInventoryAggregateEvents): ProductInventoryAggregate => {
    const {type, data} = _eventData;
    switch(type) {
        
		case 'InventoryChangedEvent':
            return {
            	...state
            }
		default: return state
    }
}
