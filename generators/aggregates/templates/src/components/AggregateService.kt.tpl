package <%= _rootPackageName%>.support

import <%= _rootPackageName%>.common.AggregateService
import <%= _rootPackageName%>.common.persistence.EventsEntityRepository
import <%= _rootPackageName%>.common.persistence.InternalEvent
import <%= _rootPackageName%>.domain.<%= _aggregate%>
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface <%= _aggregate%>Repository : CrudRepository<<%= _aggregate%>, Long> {
    fun findByAggregateId(aggregateId: UUID): <%= _aggregate%>?
}


@Component
class <%= _aggregate%>Service(
    var repository: <%= _aggregate%>Repository,
    var eventsEntityRepository: EventsEntityRepository,
) : AggregateService<<%= _aggregate%>> {

    @Transactional
    override fun persist(aggregate: <%= _aggregate%>) {
        repository.save(aggregate)
        eventsEntityRepository.saveAll(aggregate.events)

    }

    override fun findByAggregateId(aggregateId: UUID): <%= _aggregate%>? {
        return repository.findByAggregateId(aggregateId)
    }

    override fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent> {
        return  eventsEntityRepository.findByAggregateIdAndIdGreaterThanOrderByIdAsc(
            aggregateId, 0)
    }

}
