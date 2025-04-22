package <%= _packageName%>.<%=_slice%>.internal

import <%= _packageName%>.<%=_readModelSlice%>.<%- _readModel %>
import <%= _packageName%>.<%=_readModelSlice%>.<%- _readModel %>Query
import <%= _rootPackageName%>.common.Processor
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.queryhandling.QueryGateway
import mu.KotlinLogging
import org.springframework.stereotype.Component
import org.springframework.beans.factory.annotation.Autowired
import org.axonframework.eventhandling.EventHandler
import <%= _packageName%>.domain.commands.<%=_slice%>.<%- _command%>
<%-_typeImports%>
<%= _eventsImports %>

/*
Boardlink: <%- link%>
*/
@Component
class <%= _name%>: Processor {
   var logger = KotlinLogging.logger {}

     @Autowired
     lateinit var commandGateway: CommandGateway
     @Autowired
     lateinit var queryGateway: QueryGateway

<%- _triggers%>

}

