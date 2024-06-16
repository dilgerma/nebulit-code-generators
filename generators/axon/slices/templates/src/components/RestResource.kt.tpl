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
<%= _typeImports %>

<%-_payload%>

@RestController
class <%= _controller%>Ressource(private var commandGateway: CommandGateway) {

    var logger = KotlinLogging.logger {}

    @CrossOrigin
    <%-_debugendpoint%>

    @CrossOrigin
    <%-_endpoint%>

}
