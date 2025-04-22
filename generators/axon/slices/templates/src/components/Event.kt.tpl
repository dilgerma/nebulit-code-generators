package <%= _packageName%>.events

import <%= _rootPackageName%>.common.Event

<%= _typeImports %>

/*
Boardlink: <%- link%>
*/
data class <%=_name%>(
    <%- _fields%>
) : Event
