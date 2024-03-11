package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.*
import <%= _rootPackageName%>.common.persistence.InternalEvent
import org.springframework.stereotype.Component
import org.springframework.context.ApplicationEventPublisher
import <%= _rootPackageName%>.domain.<%= _aggregate%>
<%= _typeImports %>


@Component
class <%= _name%>CommandHandler(
    private var aggregateService: AggregateService<<%= _aggregate%>>,
    private var applicationEventPublisher: ApplicationEventPublisher
) : BaseCommandHandler<<%= _aggregate%>>(aggregateService) {

    override fun handle(inputCommand: Command): List<InternalEvent> {
        assert(inputCommand is <%= _commandType%>)
        val command = inputCommand as <%= _commandType%>
        val aggregate = findAggregate(command.aggregateId)
        // TODO process logic
        aggregateService.persist(aggregate)
        aggregate.events.forEach {
             applicationEventPublisher.publishEvent(it.value as Any)
        }
        return aggregate.events
    }

    override fun supports(command: Command): Boolean {
        return command is <%= _commandType%>
    }

}
