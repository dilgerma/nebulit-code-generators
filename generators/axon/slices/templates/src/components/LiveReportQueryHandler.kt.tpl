package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.QueryHandler
import org.springframework.stereotype.Component
import <%= _rootPackageName%>.<%=_slice%>.<%= _name%>
import <%= _rootPackageName%>.<%=_slice%>.<%= _name%>Query
import org.axonframework.eventsourcing.EventSourcingRepository
<%= _typeImports %>
import mu.KotlinLogging


@Component
class <%= _name%>QueryHandler(
    val eventSourcedRepository: EventSourcingRepository<<%= _name%>>
) :
    QueryHandler<<%= _name%>Query, <%= _name%>> {

        @org.axonframework.queryhandling.QueryHandler
    override fun handleQuery(query: <%= _name%>Query): <%= _name%> {
           var result =  eventSourcedRepository.load(query.aggregateId.toString())
            return result.wrappedAggregate.aggregateRoot
        }



}

