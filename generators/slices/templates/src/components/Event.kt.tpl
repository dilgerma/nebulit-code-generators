package <%= _rootPackageName%>.events

import <%= _rootPackageName%>.common.Event
<%= _typeImports %>
import mu.KotlinLogging


data class <%=_name%>(<%= _fields%>) : Event
