import {AppEvent} from "@/app/prototype/components/events";

export type <%=name%> = AppEvent<
    '<%=name%>',
    {
<%=fields%>
    }
>;