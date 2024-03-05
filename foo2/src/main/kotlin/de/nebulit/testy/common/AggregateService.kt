package de.nebulit.testy.common

import de.nebulit.testy.common.persistence.InternalEvent
import java.util.*

interface AggregateService<T:AggregateRoot> {
    fun persist(aggregate: T)
    fun findByAggregateId(aggregateId: UUID): T?

    fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent>
}
