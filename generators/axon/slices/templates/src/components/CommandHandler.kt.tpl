package <%= _rootPackageName%>.<%=_slice%>.internal

import org.springframework.stereotype.Component
import <%= _rootPackageName%>.domain.<%= _aggregate%>
<%= _typeImports %>
import mu.KotlinLogging
import org.axonframework.commandhandling.CommandHandler
import org.axonframework.eventsourcing.EventSourcingRepository
import org.axonframework.eventsourcing.eventstore.EventStore
import java.util.concurrent.Callable
import <%= _rootPackageName%>.domain.commands.<%=_slice%>.<%= _name%>

@Component
class <%= _name%>CommandHandler(
    private var aggregateRepository: EventSourcingRepository<<%= _aggregate%>>,
) {

    var logger = KotlinLogging.logger {}

    @CommandHandler
    fun handle(command: <%= _commandType%>) {

        aggregateRepository.load(
            command.aggregateId.toString(),
        ).execute {
            it.handle(command)
        }


    }

}
