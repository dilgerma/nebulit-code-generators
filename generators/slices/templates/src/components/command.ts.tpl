import {BaseCommandHandler, Command} from '@/components/common/commands/commandhandlers';
import {EventStore} from '@/components/common/eventstore/eventstore';

export class <%= _name; %> implements Command {
    type: string = <%= _name; %>.name

    <%= _constructor; %>

}
