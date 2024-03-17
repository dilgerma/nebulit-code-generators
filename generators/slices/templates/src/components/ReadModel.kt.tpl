package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.ReadModel
import <%= _rootPackageName%>.common.persistence.InternalEvent
import java.util.*
<%= _typeImports %>


class <%= _name%> : ReadModel<<%= _name%>> {

<%- _fields%>

    override fun applyEvents(events: List<InternalEvent>): <%= _name%> {
        events.forEach({
            when(it.value) {
                //TODO
                // is Event -> {}
            }
        })
        return this
    }

}



