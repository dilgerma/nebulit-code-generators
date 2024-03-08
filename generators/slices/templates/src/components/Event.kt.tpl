package <%= _rootPackageName%>.events

import <%= _rootPackageName%>.common.Event
import java.util.UUID
<%= _typeImports %>


data class <%=_name%>(<%= _fields%>) : Event
