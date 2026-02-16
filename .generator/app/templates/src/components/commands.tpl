/**
 * Command: <%=_name%>Command
 * Aggregate: <%=_aggregate%>
 *
 * Generated from config.json
 */
export type <%=_name%>Command = {
    type: '<%=_name%>';
    data: {
<%-_fields%>
    };
    metadata: {
        correlation_id?: string;
        causation_id?: string;
    };
}

/**
 * State type for <%=_name%> command handler
 */
export type <%=_name%>State = {
    // Define your aggregate state here
    exists: boolean;
}

/**
 * Initial state for the <%=_name%> aggregate
 */
export const initial<%=_name%>State: <%=_name%>State = {
    exists: false,
}

/**
 * Resulting events from this command:
<% _resultingEvents.forEach(function(event) { -%>
 * - <%=event%>
<% }); -%>
 */
export const resultingEvents = [<% _resultingEvents.forEach(function(event, index) { %>'<%=event%>'<% if (index < _resultingEvents.length - 1) { %>, <% } %><% }); %>] as const;
