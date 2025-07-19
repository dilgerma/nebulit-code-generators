import {getPostgreSQLEventStore} from "@event-driven-io/emmett-postgresql";
import {projections} from "@event-driven-io/emmett";
import {postgresUrl} from "./db";
<%-imports%>

    export const findEventstore = async () => {


    return getPostgreSQLEventStore(postgresUrl, {
        projections: projections.inline([
            <%- projections %>
        ]),
});

}