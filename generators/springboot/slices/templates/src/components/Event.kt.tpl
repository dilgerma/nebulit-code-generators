package <%= _rootPackageName%>.events

import <%= _rootPackageName%>.common.BaseEvent

<%= _typeImports %>

data class <%=_name%>(<%= _fields%>) : BaseEvent()
