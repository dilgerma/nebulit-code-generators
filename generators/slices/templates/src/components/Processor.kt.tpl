package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.Processor
import <%= _rootPackageName%>.common.DelegatingCommandHandler
import <%= _rootPackageName%>.common.persistence.EventsEntityRepository
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Component

<%= _eventsImports %>

@Component
class <%= _name%>(
 val eventsEntityRepository: EventsEntityRepository,
 val commandHandler: DelegatingCommandHandler): Processor {

<%- _triggers%>

   override fun process() {
     //TODO process readModel from events
     /*
     commandHandler.handle(<%- _command%>(<%= _variables%>))
     */
   }

}

