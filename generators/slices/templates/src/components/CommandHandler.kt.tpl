package <%= _rootPackageName%>.slices.<%=_slice%>

import <%= _rootPackageName%>.common.*
import <%= _rootPackageName%>.common.persistence.InternalEvent
import org.springframework.stereotype.Component

@Component
class <%= _name%>CommandHandler(
    private var aggregateService: AggregateService<Challenge>
) : BaseCommandHandler<Challenge>(aggregateService) {

    override fun handle(inputCommand: Command): List<InternalEvent> {
        assert(inputCommand is <%= _commandType%>)
        val command = inputCommand as <%= _commandType%>
        val aggregate = findAggregate(command.aggregateId)
        aggregate.handle(command)
        aggregateService.persist(aggregate)
        return aggregate.events
    }

    override fun supports(command: Command): Boolean {
        return command is <%= _commandType%>
    }

}
