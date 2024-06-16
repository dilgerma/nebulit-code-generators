package <%= _rootPackageName%>.<%=_slice%>

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id

import org.hibernate.annotations.JdbcTypeCode
import java.sql.Types
<%= _typeImports %>

<%-_queryElement %>

@Entity
class <%-_name%>Entity {
	<%- _entityFields %>
}

data class <%-_name%>(<%- _data %>)
