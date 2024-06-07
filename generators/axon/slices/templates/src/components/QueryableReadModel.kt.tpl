package <%= _rootPackageName%>.<%=_slice%>

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id

import org.hibernate.annotations.JdbcTypeCode
import java.sql.Types
<%= _typeImports %>

data class <%-_name%>Query(val aggregateId: UUID)

@Entity
class <%-_name%> {
	<%- _entityFields %>
}
