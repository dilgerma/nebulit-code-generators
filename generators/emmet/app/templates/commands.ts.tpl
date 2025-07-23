import type { Command } from '@event-driven-io/emmett'
import { CommandHandler } from '@event-driven-io/emmett';
import {<%-appName%>Events} from "../../events/<%-appName%>Events";
import {findEventstore} from "../../common/loadPostgresEventstore";

<%-command%>

// TODO-AI keep attributes in state optional
export type <%-commandType%>State = {
}

export const <%-commandType%>InitialState = (): <%-commandType%>State => ({
});

export const evolve = (
    state: <%-commandType%>State,
    event: <%-appName%>Events,
): <%-commandType%>State => {
    const { type, data } = event;

    switch (type) {
        // case "..Event":
        default:
            return state;
    }
};

/*
AI-TODO start: implement according to the specifications provided.
Stick to the specification, don´t add new fields, which are not specified.

in case an error is expected - throw an error

Remove the TODO Comment afterwards.

<%- aiComment %>
AI-TODO end
*/
    export const decide = (
    command: <%-commandType%>Command,
    state: <%-commandType%>State,
): <%-appName%>Events[] => {
    return [<%-resultingEvents%>]
};


const <%-commandType%>CommandHandler = CommandHandler<<%-commandType%>State, <%-appName%>Events>({evolve,initialState:<%-commandType%>InitialState});

export const handle<%-commandType%> = async (id:string,command:<%-commandType%>Command) => {
    const eventStore = await findEventstore()
    await <%-commandType%>CommandHandler(eventStore, id, (state:<%-commandType%>State)=>decide(command,state))

}

