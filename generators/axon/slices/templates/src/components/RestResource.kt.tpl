package <%= _rootPackageName%>.<%=_slice%>.internal

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import mu.KotlinLogging
import org.axonframework.commandhandling.gateway.CommandGateway
<%= _typeImports %>


@RestController
class <%= _controller%>Ressource(private var commandGateway: CommandGateway) {

    var logger = KotlinLogging.logger {}

    <%-_endpoint%>

}
