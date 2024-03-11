package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.DelegatingCommandHandler
import <%= _rootPackageName%>.<%= _slice%>.internal.<%= _command%>
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
<%= _typeImports %>

@RestController
class <%= _controller%>Ressource(private var commandHandler: DelegatingCommandHandler) {



    @PostMapping("/<%= _slice%>")
    fun processCommand(<%- _restVariables %>) {
        commandHandler.handle(<%- _command%>(<%= _variables%>))
    }
}
