package <%= _packageName%>.domain.commands.<%=_slice%>

import org.axonframework.modelling.command.TargetAggregateIdentifier
import <%= _rootPackageName%>.common.Command
<%= _typeImports %>

/*
Boardlink: <%- link%>
*/
data class <%=_name%>(
    <%- _fields%>
): Command
