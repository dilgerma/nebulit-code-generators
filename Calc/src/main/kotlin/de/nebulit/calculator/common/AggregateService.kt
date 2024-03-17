package de.nebulit.calculator.common

import de.nebulit.calculator.common.persistence.InternalEvent
import java.util.*

interface AggregateService<T:AggregateRoot> {
    fun persist(aggregate: T)
    fun findByAggregateId(aggregateId: UUID): T?

    fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent>
}
