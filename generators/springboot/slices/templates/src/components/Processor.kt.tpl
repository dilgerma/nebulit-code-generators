package <%= _rootPackageName%>.<%=_slice%>.internal

import <%= _rootPackageName%>.common.Processor
import <%= _rootPackageName%>.common.DelegatingCommandHandler
import <%= _rootPackageName%>.common.DelegatingQueryHandler
import <%= _rootPackageName%>.common.persistence.EventsEntityRepository
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Component
import mu.KotlinLogging

<%= _eventsImports %>

@Component
class <%= _name%>(
 val eventsEntityRepository: EventsEntityRepository,
 val delegatingQueryHandler:DelegatingQueryHandler,
 val commandHandler: DelegatingCommandHandler): Processor {

<%- _triggers%>

   var logger = KotlinLogging.logger {}

   override fun process() {
     //TODO process readModel from events
     /*
     commandHandler.handle(<%- _command%>(<%= _variables%>))
     */
   }

}

