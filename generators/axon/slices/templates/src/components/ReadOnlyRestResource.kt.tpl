package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.<%=_slice%>.<%- _readModel %>
import <%= _rootPackageName%>.<%=_slice%>.<%- _readModel %>Query
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import mu.KotlinLogging
import org.axonframework.queryhandling.QueryGateway
<%= _typeImports %>



@RestController
class <%= _controller%>Ressource(
    private var queryGateway: QueryGateway
    ) {

    var logger = KotlinLogging.logger {}

    @CrossOrigin
    <%-_endpoint%>

}
