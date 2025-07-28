import { pongoSingleStreamProjection } from '@event-driven-io/emmett-postgresql';
<%- eventImports %>
import {ProcessorTodoItem} from "../../process/process";


<%-readModelType%>

const evolve = (
  document: <%-readModel%>ReadModel | null,
  { type, data: event }: <%-eventsUnion%>
): <%-readModel%>ReadModel | null => {
  <%-stateAssignment%>
  switch (type) {
    /*
    AI-TODO start: implement according to the specifications provided.
    Stick to the specification, don´t add new fields, which are not specified.
    Remove the TODO Comment afterwards.
    <%- aiComment %>
    AI-TODO end
    */
    <%-caseStatements%>
    default: return {...state};
  }
};

const collectionName = '<%-collection%>-collection';

export const <%-readModel%>Projection = pongoSingleStreamProjection({
  canHandle: [<%-eventsList%>],
  collectionName,
  evolve,
});