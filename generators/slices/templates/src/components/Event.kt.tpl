package <%= _rootPackageName%>.events

import <%= _rootPackageName%>.common.Event
<%= _typeImports %>


data class <%=_name%>(<%= _fields%>) : Event
