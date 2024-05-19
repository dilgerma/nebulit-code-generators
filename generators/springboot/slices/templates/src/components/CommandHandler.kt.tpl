package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.*
import <%= _rootPackageName%>.common.persistence.InternalEvent
import org.springframework.stereotype.Component
import <%= _rootPackageName%>.domain.<%= _aggregate%>
<%= _typeImports %>
import mu.KotlinLogging
import org.springframework.transaction.annotation.Transactional


@Component
class <%= _name%>CommandHandler(
    private var aggregateService: AggregateService<<%= _aggregate%>>,
) : BaseCommandHandler<<%= _aggregate%>>(aggregateService) {

    var logger = KotlinLogging.logger {}

    @Transactional
    override fun handle(inputCommand: Command): List<InternalEvent> {
        assert(inputCommand is <%= _commandType%>)
        val command = inputCommand as <%= _commandType%>
        val aggregate = findAggregate(command.aggregateId)
        // TODO process logic
        aggregateService.persist(aggregate)
        return aggregate.events
    }

    override fun supports(command: Command): Boolean {
        return command is <%= _commandType%>
    }

}
