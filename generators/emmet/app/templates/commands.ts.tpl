import type { Command } from '@event-driven-io/emmett'
import {<%-appName%>Events} from "@/app/events/<%-appName%>Events";
import { CommandHandler } from '@event-driven-io/emmett';
import {findEventstore} from "@/app/common/loadPostgresEventstore";


<%-command%>

// TODO-AI keep attributes in state optional
export type <%-slice%>State = {
}

export const <%-slice%>InitialState = (): <%-slice%>State => ({
});

export const evolve = (
    state: <%-slice%>State,
    event: <%-appName%>Events,
): <%-slice%>State => {
    const { type, data } = event;

    switch (type) {
        // case "..Event":
        default:
            return state;
    }
};

/*
AI-TODO start: implement according to the specifications provided.
Remove the TODO Comment afterwards.
<%- aiComment %>
AI-TODO end
*/
    export const decide = (
    command: <%-commandType%>Command,
    state: <%-slice%>State,
): <%-appName%>Events[] => {
    return [<%-resultingEvents%>]
};


const <%-slice%>CommandHandler = CommandHandler<<%-slice%>State, <%-appName%>Events>({evolve,initialState:<%-slice%>InitialState});

export const handle<%-slice%> = async (id:string,command:<%-slice%>Command) => {
    const eventStore = await findEventstore()
    await <%-slice%>CommandHandler(eventStore, id, (state:<%-slice%>State)=>decide(command,state))

}

