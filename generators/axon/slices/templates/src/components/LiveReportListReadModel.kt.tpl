
package <%= _packageName%>.<%=_slice%>

import <%= _rootPackageName%>.common.Event
import <%= _rootPackageName%>.common.ReadModel
import <%= _rootPackageName%>.common.Query
import org.springframework.stereotype.Component
<%= _typeImports %>
<%= _eventsImports %>

import mu.KotlinLogging

class <%= _name%>Query(var <%-idAttribute%>: <%-idType%>): Query

/*
Boardlink: <%- link%>
*/
class <%= _name%> : ReadModel {

    val data: MutableList<Item> = mutableListOf()

   fun applyEvents(events: List<Event>):<%= _name%> {
<%- _eventLoop %>

    return this
   }


}

data class Item(<%- _fields%>)
