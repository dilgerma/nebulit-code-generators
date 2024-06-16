package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.Processor
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.queryhandling.QueryGateway
import org.springframework.stereotype.Component
import mu.KotlinLogging
import <%= _rootPackageName%>.domain.commands.<%=_slice%>.<%- _command%>
import org.axonframework.eventhandling.EventHandler


<%= _eventsImports %>

@Component
class <%= _name%>(
     val commandGateway: CommandGateway,
     val queryGateway: QueryGateway
): Processor {

<%- _triggers%>

   var logger = KotlinLogging.logger {}

   override fun process() {
     <%-_query%>
     <%-_commandInvocation%>
   }

}

