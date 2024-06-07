package <%= _rootPackageName%>.<%=_slice%>

import <%= _rootPackageName%>.common.ReadModel
import <%= _rootPackageName%>.common.Query
import org.axonframework.eventsourcing.EventSourcingHandler
import org.axonframework.eventsourcing.EventSourcingRepository
import org.axonframework.eventsourcing.eventstore.EventStore
import org.axonframework.modelling.command.AggregateIdentifier
import org.springframework.stereotype.Component
<%= _typeImports %>
<%= _eventsImports %>

import mu.KotlinLogging

class <%= _name%>Query(var aggregateId: UUID): Query


class <%= _name%> : ReadModel {

<%- _fields%>

<%- _eventHandlers %>

}
