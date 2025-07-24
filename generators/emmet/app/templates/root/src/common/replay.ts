import {PostgreSQLProjectionDefinition, rebuildPostgreSQLProjections} from "@event-driven-io/emmett-postgresql";
import {postgresUrl} from "./db";

export const replayProjection = async (slice:string, projectionName:string): Promise<void> => {
    const projectionImport = await import((`../slices/${slice}/${projectionName}.ts`))
    const projection:PostgreSQLProjectionDefinition = projectionImport[projectionName]

    return rebuildPostgreSQLProjections({projection:projection, connectionString: postgresUrl}).start();
}