import {Command, CommandHandler} from '@event-driven-io/emmett';
import {findEventStore} from '@/app/core/infrastructure/inmemoryEventstore';
import {CartEvent} from '@/app/core/events/cart/CartEvent';
import {v4} from "uuid"
import {CartItemRemovedEvent} from '@/app/core/events/cart/CartItemRemovedEvent';

export type AddItemCommand = Command<
    'AddItemCommand',
    {
        aggregateId:string,
        quantity:number
        productimage:string
        productId:string
        productName:string,
        price:number,
    }
>;

const _evolve = (state: CartAggregate, event: CartItemRemovedEvent): CartAggregate => {
    return {
        aggregateId: state.aggregateId,
        cartItemIds: [...state.cartItemIds, event.data.cartItemId]
    }
}

const _handle = (command: AddItemCommand, state: CartAggregate): CartEvent[] => {
    var events: CartEvent[] = []
    if (state.cartItemIds.length == 0) {
        events.push({
            type: 'CartSessionStarted',
            data: {
                aggregateId: command.data.aggregateId
            }
        })
    }
    events.push({
        type: 'CartItemAddedEvent',
        data: {
            cartItemId: v4(),
            aggregateId: state.aggregateId,
            productId: command.data.productId,
            price: command.data.price,
            productimage: command.data.productimage,
            productName: command.data.productName,
            quantity: command.data.quantity
        }
    });
    return events
}

const handle = CommandHandler(evolve, initialState, mapToStreamId )

export const handleAddItemCommand = async (command:AddItemCommand): Promise<CartAggregate> => {
    const { newState } = await handle(
        findEventStore(),
        command.data.aggregateId,
        (state) => _handle(command, state),
    )
    return newState
}
