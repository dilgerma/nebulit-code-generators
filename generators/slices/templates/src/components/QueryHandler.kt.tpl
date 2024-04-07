package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.AggregateService
import <%= _rootPackageName%>.common.Query
import <%= _rootPackageName%>.common.QueryHandler
import <%= _rootPackageName%>.common.ReadModel
import <%= _rootPackageName%>.domain.<%= _aggregate%>
import <%= _rootPackageName%>.common.persistence.InternalEvent
import org.springframework.stereotype.Component
import <%= _rootPackageName%>.<%=_slice%>.<%= _name%>
import <%= _rootPackageName%>.<%=_slice%>.<%= _name%>Query
<%= _typeImports %>
import mu.KotlinLogging

//TODO assumes can be rebuild from the eventstream
@Component
class <%= _name%>QueryHandler(
    private var aggregateService: AggregateService<<%= _aggregate%>>) :
    QueryHandler<UUID, <%= _name%>> {

    override fun handleQuery(query: Query<UUID>): <%= _name%> {
         return <%= _name%>().applyEvents(aggregateService.findEventsByAggregateId(query.toParam()))
    }

     override fun <T> canHandle(query: Query<T>): Boolean {
            return query is <%= _name%>Query
     }

}
