package de.nebulit.todo.domain

import de.nebulit.todo.common.AggregateRoot
import de.nebulit.todo.common.persistence.InternalEvent
import de.nebulit.todo.events.TodoAddedEvent
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.util.*


data class Todo(val name: String, val createdDate: LocalDate?, val resolvedDate: LocalDate?) {}

@Entity
@Table(name = "aggregates")
class TodoAggregate(
    @Id override var aggregateId: UUID
) : AggregateRoot {

    override var version: Long? = 0

    @Transient
    override var events: MutableList<InternalEvent> = mutableListOf()

    @Transient
    var todos = mutableListOf<Todo>()
    override fun applyEvents(events: List<InternalEvent>): AggregateRoot {
        events.map { it.value }.forEach {
            when (it) {
                is TodoAddedEvent -> {
                    this.todos.add(Todo(it.taskName, it.startDate, it.resolvedDate))
                }
            }
        }
        return this
    }

    fun newTodo(name: String) {
        if
        this.events.add(InternalEvent().apply {
            this.aggregateId = this@TodoAggregate.aggregateId
            this.value = TodoAddedEvent(name, LocalDate.now(), null)
        })
    }

}
