package <%= _rootPackageName%>.domain.commands.<%=_slice%>

import org.axonframework.modelling.command.TargetAggregateIdentifier
import <%= _rootPackageName%>.common.Command
<%= _typeImports %>

data class <%=_name%>(
    <%= _fields%>
): Command
