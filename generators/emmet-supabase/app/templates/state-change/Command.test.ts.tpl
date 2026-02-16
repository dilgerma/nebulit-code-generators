import {DeciderSpecification} from '@event-driven-io/emmett';
import {<%=commandName%>Command, <%=commandName%>State, decide, evolve} from "./<%=commandName%>Command";
import {describe, it} from "node:test";

describe('<%=commandName%> Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: () => ({})
    });

    it('spec: <%=commandName%> - should emit <%=eventName%>', () => {
        const command: <%=commandName%>Command = {
            type: '<%=commandName%>',
            data: {
<% fields.forEach(function(field, index) { %>                <%=field.name%>: <% if (typeMapping(field.type, field.cardinality) === 'string') { %>'test-<%=field.name%>'<% } else if (typeMapping(field.type, field.cardinality) === 'number') { %>123<% } else if (typeMapping(field.type, field.cardinality) === 'boolean') { %>true<% } else { %>new Date()<% } %><% if (index < fields.length - 1) { %>,<% } %>
<% }); %>            },
            metadata: {now: new Date()},
        }

        given([])
            .when(command)
            .then([{
                type: '<%=eventName%>',
                data: {
<% fields.forEach(function(field, index) { %>                    <%=field.name%>: command.data.<%=field.name%><% if (index < fields.length - 1) { %>,<% } %>
<% }); %>                },
                metadata: {}
            }])
    });
});
