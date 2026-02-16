/**
 * Read Model: <%=_name%>ReadModel
 * Aggregate: <%=_aggregate%>
 * List Element: <%=_isListElement%>
 *
 * Generated from config.json
 */

/**
 * Single item type for the read model
 */
export type <%=_name%>ReadModelItem = {
<%-_fields%>
}

/**
 * Full read model type
 */
export type <%=_name%>ReadModel = {
    data: <% if (_isListElement) { %><%=_name%>ReadModelItem[]<% } else { %><%=_name%>ReadModelItem<% } %>;
}

/**
 * Inbound events that update this read model:
<% _inboundEvents.forEach(function(event) { -%>
 * - <%=event%>
<% }); -%>
 */
export const inboundEvents = [<% _inboundEvents.forEach(function(event, index) { %>'<%=event%>'<% if (index < _inboundEvents.length - 1) { %>, <% } %><% }); %>] as const;

/**
 * Projection function to apply events to the read model
 */
export function apply<%=_name%>Projection(
    state: <%=_name%>ReadModel,
    event: { type: string; data: any }
): <%=_name%>ReadModel {
    switch (event.type) {
<% _inboundEvents.forEach(function(eventName) { -%>
        case '<%=eventName%>':
            // TODO: Implement projection logic for <%=eventName%>
            return state;
<% }); -%>
        default:
            return state;
    }
}
