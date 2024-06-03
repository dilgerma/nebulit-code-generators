package <%= _rootPackageName%>.domain

import org.axonframework.modelling.command.AggregateIdentifier
import org.axonframework.spring.stereotype.Aggregate
import java.util.UUID
<%-_typeImports%>

@Aggregate
class <%=_name%> {

    @AggregateIdentifier
    lateinit var aggregateId: UUID

<%-_fields%>
}
