package de.nebulit.todo.slices.addtodo

import de.nebulit.todo.common.*
import de.nebulit.todo.common.persistence.InternalEvent
import de.nebulit.todo.domain.TodoAggregate
import org.springframework.stereotype.Component

@Component
class AddTodoCommandCommandHandler(
    private var aggregateService: AggregateService<TodoAggregate>
) : BaseCommandHandler<TodoAggregate>(aggregateService) {

    override fun handle(inputCommand: Command): List<InternalEvent> {
        assert(inputCommand is AddTodoCommand)
        val command = inputCommand as AddTodoCommand
        val aggregate = findAggregate(command.aggregateId)
        aggregate.handle(command)
        aggregateService.persist(aggregate)
        return aggregate.events
    }

    override fun supports(command: Command): Boolean {
        return command is AddTodoCommand
    }

}
