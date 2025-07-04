import {DeciderSpecification} from '@event-driven-io/emmett';
<%-imports%>
import {describe, it} from "node:test";



describe('<%-slice%> Specification', () => {

        const given = DeciderSpecification.for({
            decide,
            evolve,
            initialState: ()=>({})
        });

        <%-scenarios%>

    });
