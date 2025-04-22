package <%= _packageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.QueryHandler
import <%= _rootPackageName%>.common.Event
import org.springframework.stereotype.Component
import <%= _packageName%>.<%=_slice%>.<%= _name%>
import <%= _packageName%>.<%=_slice%>.<%= _name%>Query
<%= _typeImports %>
import mu.KotlinLogging
import org.axonframework.eventsourcing.eventstore.EventStore


/*
Boardlink: <%- link%>
*/
@Component
class <%= _name%>QueryHandler(
    val eventStore: EventStore
) :
    QueryHandler<<%= _name%>Query, <%= _name%>> {

        @org.axonframework.queryhandling.QueryHandler
    override fun handleQuery(query: <%= _name%>Query): <%= _name%> {
           val events =
                   eventStore
                       .readEvents(query.aggregateId.toString())
                       .asStream()
                       .filter { it.payload is Event }
                       .map { it.payload as Event }
                       .toList()

               return <%= _name%>().applyEvents(events)
        }



}

