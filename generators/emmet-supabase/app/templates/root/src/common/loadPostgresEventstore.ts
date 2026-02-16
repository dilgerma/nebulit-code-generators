import {getPostgreSQLEventStore} from "@event-driven-io/emmett-postgresql";
import {projections} from "@event-driven-io/emmett";
import {postgresUrl} from "./db";

export const findEventstore = async () => {

    return getPostgreSQLEventStore(postgresUrl, {
        schema: {
            autoMigration: "CreateOrUpdate"
        },
        projections: projections.inline([
        ]),

    });

}
