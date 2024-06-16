package <%= _rootPackageName%>.<%=_slice%>.internal

import org.axonframework.eventhandling.EventHandler
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component
<%= _typeImports %>
<%= _eventsImports %>
import <%= _rootPackageName%>.<%=_slice%>.<%= _name%>Entity


import mu.KotlinLogging

interface <%-_name%>Repository : JpaRepository<<%-_name%>Entity, UUID>

@Component
class <%-_name%>Projector(
    var repository: <%-_name%>Repository
) {

    <%- _eventHandlers %>

}
