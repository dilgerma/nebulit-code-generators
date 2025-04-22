package <%= _packageName%>.<%=_slice%>

import jakarta.persistence.ElementCollection
import jakarta.persistence.CollectionTable
import jakarta.persistence.JoinColumn
import jakarta.persistence.Entity
import jakarta.persistence.Column
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import org.hibernate.annotations.Cascade
import org.hibernate.annotations.CascadeType
import jakarta.persistence.IdClass
import jakarta.persistence.Embeddable


import org.hibernate.annotations.JdbcTypeCode
import java.sql.Types
<%= _typeImports %>

data class <%-_name%>Query(<%-_keyFields%>)

@Embeddable
data class <%-_name%>Key(<%-_annotatedKeyFields%>)

@IdClass(<%-_name%>Key::class)
@Entity
class <%-_name%>Entity {
	<%- _entityFields %>
}

/*
Boardlink: <%- link%>
*/
data class <%-_name%>(<%- _data %>)