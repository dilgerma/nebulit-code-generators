import type { Event } from '@event-driven-io/emmett';
import type { ProductPricingAggregateEvents } from '@/app/core/events/ProductPricingAggregate/ProductPricingAggregateEvents';

export type ProductPricingAggregate = {

    		aggregateId:string
}

export const initialState = (): ProductPricingAggregate => {
    return {
        		aggregateId:""
    };
}

export const mapToStreamId = (id: string) => {
    return `ProductPricingAggregate-${id}`;
}

export const evolve = (state: ProductPricingAggregate, _eventData: ProductPricingAggregateEvents): ProductPricingAggregate => {
    const {type, data} = _eventData;
    switch(type) {
        
		case 'PriceChangedEvent':
            return {
            	...state
            }
		default: return state
    }
}
