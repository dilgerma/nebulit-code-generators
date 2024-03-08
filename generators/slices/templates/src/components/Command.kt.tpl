package <%= _rootPackageName%>.<%=_slice%>

import <%= _rootPackageName%>.common.Command
<%= _typeImports %>

data class <%=_name%>(<%= _fields%>) : Command
