import {EventEnvelope} from "@event-driven-io/emmett";

export type Subscriber = {
    streamId?:string
    on(streamId: string, event: EventEnvelope[]):void;
}