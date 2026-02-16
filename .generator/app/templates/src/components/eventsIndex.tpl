/**
 * Events Index
 *
 * Generated from config.json
 */

<% _events.forEach(function(event) { -%>
import { <%=event%> } from './<%=event%>';
<% }); -%>

/**
 * Union type of all events
 */
export type AppEvents = <% _events.forEach(function(event, index) { %><%=event%><% if (index < _events.length - 1) { %> | <% } %><% }); %>;

/**
 * Re-export all event types
 */
export {
<% _events.forEach(function(event, index) { -%>
    <%=event%><% if (index < _events.length - 1) { %>,<% } %>

<% }); -%>
};
