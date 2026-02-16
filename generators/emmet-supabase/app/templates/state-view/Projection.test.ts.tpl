import {before, after, describe, it} from "node:test";
import {PostgreSQLProjectionAssert, PostgreSQLProjectionSpec} from "@event-driven-io/emmett-postgresql";
import {<%=readModelName%>Projection, tableName} from "./<%=readModelName%>Projection";
import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";
import {EventType} from "../../events/EventType"
import knex, {Knex} from 'knex';
import assert from 'assert';
import {runFlywayMigrations} from "../../common/testHelpers";

describe('<%=readModelName%> Specification', () => {
    let postgres: StartedPostgreSqlContainer;
    let connectionString: string;
    let db: Knex;

    let given: PostgreSQLProjectionSpec<EventType>

    before(async () => {
        postgres = await new PostgreSqlContainer("postgres").start();
        connectionString = postgres.getConnectionUri();

        db = knex({
            client: 'pg',
            connection: connectionString,
        });

        await runFlywayMigrations(connectionString);

        given = PostgreSQLProjectionSpec.for({
            projection: <%=readModelName%>Projection,
            connectionString,
        });
    });

    after(async () => {
        await db?.destroy();
        await postgres?.stop();
    });

    it('spec: <%=readModelName%> - should project event', async () => {
        const assertReadModel: PostgreSQLProjectionAssert = async ({connectionString: connStr}) => {
            const queryDb = knex({
                client: 'pg',
                connection: connStr,
            });

            try {
                const result = await queryDb(tableName)
                    .withSchema('public')
                    .select('*');

                assert.strictEqual(result.length, 1);
                // Add more assertions here
            } finally {
                await queryDb.destroy();
            }
        };

        await given([<% if (events.length > 0) { %>{
            type: '<%=toPascalCase(events[0].title)%>',
            data: {
<% events[0].fields?.forEach(function(field, index) { %>                <%=field.name%>: <% if (typeMapping(field.type, field.cardinality) === 'string') { %>'test-<%=field.name%>'<% } else if (typeMapping(field.type, field.cardinality) === 'number') { %>123<% } else if (typeMapping(field.type, field.cardinality) === 'boolean') { %>true<% } else { %>new Date()<% } %><% if (index < events[0].fields.length - 1) { %>,<% } %>
<% }); %>            },
            metadata: {streamName: 'test-stream-1'}
        }<% } %>])
            .when([])
            .then(assertReadModel);
    });
});
