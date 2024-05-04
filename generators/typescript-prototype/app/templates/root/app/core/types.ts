import {Command} from '@event-driven-io/emmett';

export type CommandConfig = {
    command: string
    handler: (command:any)=>any,
    schema: any // json schema
}
