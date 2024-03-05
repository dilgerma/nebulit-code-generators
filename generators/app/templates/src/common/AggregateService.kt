package <%= rootPackageName%>.common

import <%= rootPackageName%>.common.persistence.InternalEvent
import java.util.*

interface AggregateService<T:AggregateRoot> {
    fun persist(aggregate: T)
    fun findByAggregateId(aggregateId: UUID): T?

    fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent>
}
