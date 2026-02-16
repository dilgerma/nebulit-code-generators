/**
 * Event: <%=_name%>
 * Aggregate: <%=_aggregate%>
 *
 * Generated from config.json
 */
export type <%=_name%> = {
    type: '<%=_name%>';
    data: {
<%-_fields%>
    };
    metadata: {
        streamName?: string;
        correlation_id?: string;
        causation_id?: string;
    };
}