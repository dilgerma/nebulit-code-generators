import type { Event } from '@event-driven-io/emmett';

export type <%=_eventTitle%> = Event<
    '<%=_eventTitle%>',
    {
<%=_fields%>
    }
>;
