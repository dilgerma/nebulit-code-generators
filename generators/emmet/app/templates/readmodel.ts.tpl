import { pongoSingleStreamProjection } from '@event-driven-io/emmett-postgresql';
<%- eventImports %>

<%-readModelType%>

const evolve = (
  document: <%-readModel%>ReadModel | null,
  { type, data: event }: <%-eventsUnion%>
): <%-readModel%>ReadModel | null => {
  const state: CartItemsReadModel = {...document, data: [...document?.data??[]]};
  switch (type) {
    /*
    AI-TODO start: implement according to the specifications provided.
    Remove the TODO Comment afterwards.
    <%- aiComment %>
    AI-TODO end
    */
    <%-caseStatements%>
    default: return {...state};
  }
};

const collectionName = '<%-readModel%>-collection';

export const <%-readModel%>Projection = pongoSingleStreamProjection({
  canHandle: [<%-eventsList%>],
  collectionName,
  evolve,
});