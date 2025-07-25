import {before, describe, it} from "node:test";
import {expectPongoDocuments, PostgreSQLProjectionSpec} from "@event-driven-io/emmett-postgresql";
import {<%- readModel %>Projection, <%- readModel %>ReadModel} from "./<%- readModel %>Projection";
import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";
<%-imports%>

describe('<%- readModel %> Specification', () => {
    let postgres: StartedPostgreSqlContainer;
    let connectionString:string

    let given: PostgreSQLProjectionSpec<<%- eventsUnion %>>

    before(async () => {
        postgres = await new PostgreSqlContainer("postgres").start();
        connectionString = postgres.getConnectionUri();

        given = PostgreSQLProjectionSpec.for({
            projection: <%- readModel %>Projection,
            connectionString,
        });
    });

    <%-scenarios%>

});
