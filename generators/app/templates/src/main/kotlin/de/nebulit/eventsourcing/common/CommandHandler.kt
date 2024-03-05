package de.nebulit.eventsourcing.common

import de.nebulit.eventsourcing.common.persistence.InternalEvent
import de.nebulit.eventsourcing.challenge.slices.addgoal.AddGoalCommand
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

    override fun supports(command: Command): Boolean {
        return command is AddGoalCommand
    }

}


@Component
class DelegatingCommandHandler<U:AggregateRoot>(var commandHandlers: List<CommandHandler>, var aggregateService: AggregateService<U>) : BaseCommandHandler<U>(aggregateService) {
    override fun handle(command: Command): List<InternalEvent> {
        return commandHandlers.first { it.supports(command) }.handle(command)
    }
}
