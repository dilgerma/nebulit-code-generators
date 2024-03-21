package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.DelegatingCommandHandler
import <%= _rootPackageName%>.<%= _slice%>.internal.<%= _command%>
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
<%= _typeImports %>
import mu.KotlinLogging


@RestController
class <%= _controller%>Ressource(private var commandHandler: DelegatingCommandHandler) {

    var logger = KotlinLogging.logger {}

    <%-_endpoint%>

}
