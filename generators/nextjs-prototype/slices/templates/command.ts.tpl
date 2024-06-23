import {Command, CommandHandler} from '@event-driven-io/emmett';
<%-_aggregateEventImports%>
<%-_aggregateImports%>
import {findEventStore} from '@/app/core/infrastructure/inmemoryEventstore';
<%-_eventImports%>
<%-_cartAggregateHandlerImports%>

export type <%=_commandName%> = Command<
    '<%=_commandName%>',
    {
<%-_commandFields%>
    }
>;

<%-_handlePerAggregate%>

<%-_cartAggregateHandlers%>

<%- _handleCommand %>
