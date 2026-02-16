import {postgreSQLRawSQLProjection} from '@event-driven-io/emmett-postgresql';
import {sql} from '@event-driven-io/dumbo';
import knex, {Knex} from 'knex';
import {EventType} from '../../events/EventType';

export type <%=readModelName%>ReadModelItem = {
<% fields.forEach(function(field, index) { %>    <%=field.name%>?: <%=typeMapping(field.type, field.cardinality)%>;
<% }); %>}

export type <%=readModelName%>ReadModel = {
    data: <%=readModelName%>ReadModelItem[],
}

export const tableName = '<%=tableName%>';

export const getKnexInstance = (connectionString: string): Knex => {
    return knex({
        client: 'pg',
        connection: connectionString,
    });
};

export const <%=readModelName%>Projection = postgreSQLRawSQLProjection<EventType>({
    canHandle: [<% events.forEach(function(event, index) { %>"<%=toPascalCase(event.title)%>"<% if (index < events.length - 1) { %>, <% } %><% }); %>],
    evolve: (event, context) => {
        const {type, data} = event;
        const db = getKnexInstance(context.connection.connectionString);

        switch (type) {
<% events.forEach(function(event) { %>            case "<%=toPascalCase(event.title)%>":
                return sql(db(tableName)
                    .withSchema('public')
                    .insert({
<% event.fields?.forEach(function(field, index) { %>                        <%=field.name%>: data.<%=field.name%><% if (index < event.fields.length - 1) { %>,<% } %>
<% }); %>                    })
<% if (event.fields?.some(f => f.idAttribute)) { %>                    .onConflict('<%=event.fields.find(f => f.idAttribute).name%>')
                    .merge({
<% event.fields?.filter(f => !f.idAttribute).forEach(function(field, index, arr) { %>                        <%=field.name%>: data.<%=field.name%><% if (index < arr.length - 1) { %>,<% } %>
<% }); %>                    })
<% } %>                    .toQuery());

<% }); %>            default:
                return [];
        }
    }
});
