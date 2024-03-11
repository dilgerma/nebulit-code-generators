package de.nebulit.todo.support

import de.nebulit.todo.common.AggregateService
import de.nebulit.todo.common.persistence.EventsEntityRepository
import de.nebulit.todo.common.persistence.InternalEvent
import de.nebulit.todo.domain.ToDoAggregate
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface ToDoAggregateRepository : CrudRepository<ToDoAggregate, Long> {
    fun findByAggregateId(aggregateId: UUID): ToDoAggregate?
}


@Component
class ToDoAggregateService(
    var repository: ToDoAggregateRepository,
    var eventsEntityRepository: EventsEntityRepository,
) : AggregateService<ToDoAggregate> {

    @Transactional
    override fun persist(aggregate: ToDoAggregate) {
        repository.save(aggregate)
        eventsEntityRepository.saveAll(aggregate.events)

    }

    override fun findByAggregateId(aggregateId: UUID): ToDoAggregate? {
        return repository.findByAggregateId(aggregateId)
    }

    override fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent> {
        return  eventsEntityRepository.findByAggregateIdAndIdGreaterThanOrderByIdAsc(
            aggregateId, 0)
    }

}
