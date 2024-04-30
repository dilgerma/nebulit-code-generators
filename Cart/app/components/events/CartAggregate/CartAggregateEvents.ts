import {CarttemAddedEvent} from "@/app/components/events/CartAggregate/CarttemAddedEvent"
import {CartClearedEvent} from "@/app/components/events/CartAggregate/CartClearedEvent"
import {CartSubmittedEvent} from "@/app/components/events/CartAggregate/CartSubmittedEvent"
import {CartItemRemovedEvent} from "@/app/components/events/CartAggregate/CartItemRemovedEvent"
import {ProductRevokedEvent} from "@/app/components/events/CartAggregate/ProductRevokedEvent"
import {ProductRevocationRequestedEvent} from "@/app/components/events/CartAggregate/ProductRevocationRequestedEvent"
import {CartSessionStartedEvent} from "@/app/components/events/CartAggregate/CartSessionStartedEvent"

export type CartAggregateEvents =
    CarttemAddedEvent|
	CartClearedEvent|
	CartSubmittedEvent|
	CartItemRemovedEvent|
	ProductRevokedEvent|
	ProductRevocationRequestedEvent|
	CartSessionStartedEvent
