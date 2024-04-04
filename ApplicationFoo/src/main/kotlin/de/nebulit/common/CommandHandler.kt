package de.nebulit.common

import de.nebulit.common.persistence.InternalEvent
import org.springframework.stereotype.Component
import java.util.*

interface CommandDecision {
    fun supports(command: Command): Boolean
}

interface CommandHandler : CommandDecision {
    fun handle(command: Command): List<InternalEvent>
}


abstract class BaseCommandHandler<U : AggregateRoot>(
    private var aggregateService: AggregateService<U>
) : CommandHandler {

    protected fun findAggregate(aggregateId: UUID): U {
        val events = aggregateService.findEventsByAggregateId(aggregateId)
        val aggregate = aggregateService.findByAggregateId(aggregateId)
            ?: throw CommandException("aggregate $aggregateId does not exist.")
        aggregate.applyEvents(events)
        return aggregate
    }

}


@Component
class DelegatingCommandHandler(var commandHandlers: List<CommandHandler>)  {
    fun handle(command: Command): List<InternalEvent> {
        return commandHandlers.first { it.supports(command) }.handle(command)
    }
}
