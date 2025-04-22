import {DefaultRecord, Event} from '@event-driven-io/emmett';

export type AppEvent<
    EventType extends string = string,
    EventData extends DefaultRecord = DefaultRecord,
    EventMetaData extends DefaultRecord = DefaultRecord
> = Event<EventType, EventData, EventMetaData & { aggregate: string }>;
