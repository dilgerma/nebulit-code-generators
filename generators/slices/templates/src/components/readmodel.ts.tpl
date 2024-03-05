import {Readmodel} from '@/components/common/readmodels/readmodel';
import {EventStore} from '@/components/common/eventstore/eventstore';

class <%= _name; %> implements Readmodel {
    type: string = <%= _name; %>.name

<%= _variables; %>


    apply(): <%= _name; %> {
        return this
    }


}
