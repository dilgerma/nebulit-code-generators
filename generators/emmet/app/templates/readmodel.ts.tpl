import { pongoSingleStreamProjection } from '@event-driven-io/emmett-postgresql';
<%- eventImports %>

<%-readModelType%>

const evolve = (
  document: <%-readModel%>ReadModel | null,
  { type, data: event }: <%-eventsUnion%>
): <%-readModel%>ReadModel | null => {
  switch (type) {
    <%-caseStatements%>
    default: return document;
  }
};

const collectionName = '<%-readModel%>-collection';

export const <%-readModel%>Projection = pongoSingleStreamProjection({
  canHandle: [<%-eventsList%>],
  collectionName,
  evolve,
});