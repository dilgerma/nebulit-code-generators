package de.nebulit.todo.support

import de.nebulit.todo.common.AggregateService
import de.nebulit.todo.common.persistence.EventsEntityRepository
import de.nebulit.todo.common.persistence.InternalEvent
import de.nebulit.todo.domain.TodoAggregate
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface TodoRepository : CrudRepository<TodoAggregate, Long> {
    fun findByAggregateId(aggregateId: UUID): TodoAggregate?
}


@Component
class TodoAggregateService(
    var todoRepository: TodoRepository,
    var eventsEntityRepository: EventsEntityRepository,
) : AggregateService<TodoAggregate> {

    @Transactional
    override fun persist(todo: TodoAggregate) {
        todoRepository.save(todo)
        eventsEntityRepository.saveAll(todo.events)

    }

    override fun findByAggregateId(aggregateId: UUID): TodoAggregate? {
        return todoRepository.findByAggregateId(aggregateId)
    }

    override fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent> {
        return  eventsEntityRepository.findByAggregateIdAndIdGreaterThanOrderByIdAsc(
            aggregateId, 0)
    }

}
