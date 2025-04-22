package <%= _packageName%>.<%=_slice%>.internal

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RestController
import mu.KotlinLogging
import org.axonframework.commandhandling.gateway.CommandGateway
import <%= _packageName%>.domain.commands.<%=_slice%>.<%- _command%>

<%= _typeImports %>
import java.util.concurrent.CompletableFuture


<%-_payload%>

/*
Boardlink: <%- link%>
*/
@RestController
class <%= _controller%>(private var commandGateway: CommandGateway) {

    var logger = KotlinLogging.logger {}

    <%-_debugendpoint%>

    <%-_endpoint%>

}
