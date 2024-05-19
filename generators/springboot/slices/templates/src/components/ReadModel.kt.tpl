package <%= _rootPackageName%>.<%=_slice%>

import <%= _rootPackageName%>.common.Query
import <%= _rootPackageName%>.common.ReadModel
import <%= _rootPackageName%>.common.persistence.InternalEvent
<%= _typeImports %>
<%= _eventsImports %>

import mu.KotlinLogging

//TODO adjust the query to the necessary parameters
class <%= _name%>Query(var aggregateId: UUID) : Query<UUID> {
    override fun toParam(): UUID {
        return aggregateId
    }
}

class <%= _name%> : ReadModel<<%= _name%>> {

    var logger = KotlinLogging.logger {}

<%- _fields%>

    override fun applyEvents(events: List<InternalEvent>): <%= _name%> {
        events.forEach {
            when (it.value) {
                <%-_switchCase%>
            }
        }
        return this
    }

}

