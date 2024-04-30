import type { Event } from '@event-driven-io/emmett';
import type { CartAggregateEvents } from '@/app/core/events//CartAggregateEvents';

export type CartAggregate = {

    		aggregateId:string
		cartItemIds:string[]
}

export const initialState = (): CartAggregate => {
    return {
        		aggregateId:"",
		cartItemIds:[]
    };
}

export const mapToStreamId = (id: string) => {
    return `CartAggregate-${id}`;
}

export const evolve = (state: CartAggregate, _eventData: CartAggregateEvents): CartAggregate => {
    const {type, data} = _eventData;
    switch(type) {

		case 'CarttemAddedEvent':
            return {
            	...state
            }

		case 'CartClearedEvent':
            return {
            	...state
            }

		case 'CartSubmittedEvent':
            return {
            	...state
            }

		case 'CartItemRemovedEvent':
            return {
            	...state
            }

		case 'ProductRevokedEvent':
            return {
            	...state
            }

		case 'ProductRevocationRequestedEvent':
            return {
            	...state
            }

		case 'CartSessionStartedEvent':
            return {
            	...state
            }
		default: return state
    }
}
