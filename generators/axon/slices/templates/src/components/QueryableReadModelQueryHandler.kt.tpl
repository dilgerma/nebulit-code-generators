package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.<%=_slice%>.<%=_name%>
import org.springframework.stereotype.Component
import <%= _rootPackageName%>.<%=_slice%>.internal.<%=_name%>Repository
import org.axonframework.queryhandling.QueryHandler
import <%= _rootPackageName%>.<%=_slice%>.<%= _name%>Query
<%= _typeImports %>

@Component
class <%= _name%>QueryHandler(private val repository:<%-_name%>Repository) {

  @QueryHandler
  fun handleQuery(query: <%-_name%>Query): <%-_name%>? {
      return repository.findById(query.aggregateId).orElse(null)
  }

}
