import {Command, DefaultCommandMetadata, DefaultRecord} from "@event-driven-io/emmett";

export type AppCommand<
    CommandType extends string = string,
    CommandData extends DefaultRecord = DefaultRecord,
    CommandMetaData extends DefaultCommandMetadata = DefaultCommandMetadata
> = Command<CommandType, CommandData, CommandMetaData & { slice: string, aggregate?: string }>;

export type CommandResult ={ events: string[], enabled: boolean }

export const commandSchema = async (slice:string, command:string):Promise<string> => {
    return import(`./slices/${slice}/${command}.json`)
}