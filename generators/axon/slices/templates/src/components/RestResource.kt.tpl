package <%= _rootPackageName%>.<%=_slice%>.internal

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RestController
import mu.KotlinLogging
import org.axonframework.commandhandling.gateway.CommandGateway
import <%= _rootPackageName%>.domain.commands.<%=_slice%>.<%- _command%>
import <%= _rootPackageName%>.common.CommandResult

<%= _typeImports %>
import java.util.concurrent.CompletableFuture


<%-_payload%>

@RestController
class <%= _controller%>Ressource(private var commandGateway: CommandGateway) {

    var logger = KotlinLogging.logger {}

    <%-_debugendpoint%>

    <%-_endpoint%>

}
