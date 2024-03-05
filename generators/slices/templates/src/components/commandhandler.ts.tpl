import {BaseCommandHandler, Command} from '@/components/common/commands/commandhandlers';
import {getEventStore} from '@/components/common/eventstore/getEventstore';
<%- _imports; %>
<%- _globalImports; %>


const SLICE = "<%= _slice; %>"
export class <%= _name; %>CommandHandler extends BaseCommandHandler {
    constructor() {
        super(<%= _name; %>.name)
    }

    handle(command: <%= _name; %>) {
        getEventStore().addEvent(`stream`,
            <%= _eventInvocations; %>
        )
    }

    supports(type: string): boolean {
        return this.type == type
    }

}

