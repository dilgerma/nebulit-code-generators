import {Event} from '@/components/common/eventstore/eventstore';

export class <%= _name; %> implements Event {

    type = <%= _name; %>.name

    public readonly timestamp = new Date().getDate()

       <%= _constructor; %>

}
