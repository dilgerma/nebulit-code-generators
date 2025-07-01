import {DeciderSpecification} from '@event-driven-io/emmett';
import {<%-slice%>Command, <%-slice%>State, decide, evolve} from "./<%-slice%>Command";
import {describe, it} from "node:test";



describe('<%-slice%> Specification', () => {

        const given = DeciderSpecification.for({
            decide,
            evolve,
            initialState: ()=>({})
        });

        <%-scenarios%>

    });
