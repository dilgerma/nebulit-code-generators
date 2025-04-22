package <%= _rootPackageName%>.domain

import org.axonframework.modelling.command.AggregateIdentifier
import org.axonframework.spring.stereotype.Aggregate
import org.axonframework.commandhandling.CommandHandler
import org.axonframework.eventsourcing.EventSourcingHandler
import org.axonframework.modelling.command.AggregateLifecycle
import org.axonframework.modelling.command.AggregateCreationPolicy
import org.axonframework.modelling.command.CreationPolicy

import java.util.UUID
<%-_typeImports%>
<%-_elementImports%>

@Aggregate
class <%=_name%> {

    @AggregateIdentifier
    var <%-_idField%>:<%-_idType%>? = null

    <%-_commandHandlers%>

<%-_fields%>
}
