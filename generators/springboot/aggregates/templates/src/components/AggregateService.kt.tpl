package <%= _rootPackageName%>.support

import <%= _rootPackageName%>.common.AggregateService
import <%= _rootPackageName%>.common.persistence.EventsEntityRepository
import <%= _rootPackageName%>.common.persistence.InternalEvent
import <%= _rootPackageName%>.domain.<%= _aggregate%>
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.context.ApplicationEventPublisher
import java.util.UUID

interface <%= _aggregate%>Repository : CrudRepository<<%= _aggregate%>, Long> {
    fun findByAggregateId(aggregateId: UUID): <%= _aggregate%>?

    fun existsByAggregateId(aggregateId: UUID): Boolean

}


@Component
class <%= _aggregate%>Service(
    val repository: <%= _aggregate%>Repository,
    val eventsEntityRepository: EventsEntityRepository,
    val applicationEventPublisher: ApplicationEventPublisher
) : AggregateService<<%= _aggregate%>> {

    @Transactional
    override fun persist(aggregate: <%= _aggregate%>) {
        repository.save(aggregate)
        if (aggregate.events.isNotEmpty()) {
            eventsEntityRepository.saveAll(aggregate.events)
            aggregate.events.forEach {
                applicationEventPublisher.publishEvent(it.value as Any)
            }
        }

    }

    override fun existsByAggregateId(aggregateId: UUID): Boolean {
        return repository.existsByAggregateId(aggregateId)
    }

    override fun findByAggregateId(aggregateId: UUID): <%= _aggregate%>? {
        return repository.findByAggregateId(aggregateId)
    }

    override fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent> {
        return eventsEntityRepository.findByAggregateIdAndIdGreaterThanOrderByIdAsc(
            aggregateId, 0)
    }

}
