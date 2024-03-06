package <%= _rootPackageName%>.slices.<%=_slice%>

import <%= _rootPackageName%>.common.Command
import java.util.UUID

data class <%=_name%>(override var aggregateId: UUID, <%= _fields%>) : Command
