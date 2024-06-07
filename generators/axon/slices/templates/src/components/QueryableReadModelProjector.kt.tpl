package <%= _rootPackageName%>.<%=_slice%>.internal

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id

import org.axonframework.eventhandling.EventHandler
import org.hibernate.annotations.JdbcTypeCode
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component
import java.sql.Types
<%= _typeImports %>
<%= _eventsImports %>
import <%= _rootPackageName%>.<%=_slice%>.<%= _name%>


import mu.KotlinLogging

interface <%-_name%>Repository : JpaRepository<<%-_name%>, UUID>

@Component
class <%-_name%>Projector(
    var repository: <%-_name%>Repository
) {

    <%- _eventHandlers %>

}
