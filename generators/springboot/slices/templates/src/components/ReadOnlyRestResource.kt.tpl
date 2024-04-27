package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.DelegatingQueryHandler
import <%= _rootPackageName%>.<%= _slice%>.<%= _readModel%>
import <%= _rootPackageName%>.<%= _slice%>.<%= _readModel%>Query
import <%= _rootPackageName%>.common.persistence.EventsEntityRepository
import <%= _rootPackageName%>.common.ReadModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
<%= _typeImports %>
import mu.KotlinLogging


@RestController
class <%= _controller%>Ressource(
    private var repository: EventsEntityRepository,
    private var delegatingQueryHandler: DelegatingQueryHandler
    ) {

    var logger = KotlinLogging.logger {}

    @CrossOrigin
    <%-_endpoint%>

}
