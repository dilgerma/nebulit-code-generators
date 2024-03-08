package de.nebulit.todo.addtodo

import de.nebulit.todo.common.*
import de.nebulit.todo.common.persistence.InternalEvent
import org.springframework.stereotype.Component
import java.time.LocalDate;
import java.util.UUID


@Component
class AddTodoCommandCommandHandler(
    private var aggregateService: AggregateService<AGGREGATE>
) : BaseCommandHandler<AGGREGATE>(aggregateService) {

    override fun handle(inputCommand: Command): List<InternalEvent> {
        assert(inputCommand is AddTodoCommand)
        val command = inputCommand as AddTodoCommand
        val aggregate = findAggregate(command.aggregateId)
        // TODO process logic
        aggregateService.persist(aggregate)
        return aggregate.events
    }

    override fun supports(command: Command): Boolean {
        return command is AddTodoCommand
    }

}
