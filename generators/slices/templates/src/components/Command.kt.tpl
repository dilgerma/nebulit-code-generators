package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.Command
<%= _typeImports %>

data class <%=_name%>(<%= _fields%>) : Command
