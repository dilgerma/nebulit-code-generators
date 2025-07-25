/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

import type {Event, EventEnvelope} from '@event-driven-io/emmett'
import {
    type AggregateStreamOptions,
    type AggregateStreamResult,
    type AppendToStreamOptions,
    type AppendToStreamResult,
    assertExpectedVersionMatchesCurrent,
    type EventStore,
    type ReadStreamOptions,
    type ReadStreamResult,
} from '@event-driven-io/emmett';
import {v4} from "uuid"

const streams = new Map<string, EventEnvelope[]>();

export const debugAllStreams = (): Map<string, EventEnvelope[]> => {
    return streams
}

export const findEventStore = (): EventStore => {

    const getAllEventsCount = () => {
        return Array.from<EventEnvelope[]>(streams.values())
            .map((s) => s.length)
            .reduce((p, c) => p + c, 0);
    };

    return {

        async aggregateStream<State, EventType extends Event>(
            streamName: string,
            options: AggregateStreamOptions<State, EventType>,
        ): Promise<AggregateStreamResult<State> | null> {
            const {evolve, getInitialState, read} = options;

            const result = await this.readStream<EventType>(streamName, read);

            if (!result) return null;

            const events = result?.events ?? [];

            return {
                currentStreamVersion: BigInt(events.length),
                state: events.reduce(evolve, getInitialState()),
            };
        },

        readStream: <EventType extends Event>(
            streamName: string,
            options?: ReadStreamOptions,
        ): Promise<ReadStreamResult<EventType>> => {
            const events = streams.get(streamName);
            const currentStreamVersion = events ? BigInt(events.length) : undefined;

            assertExpectedVersionMatchesCurrent(
                currentStreamVersion,
                options?.expectedStreamVersion,
            );

            const from = Number(options && 'from' in options ? options.from : 0);
            const to = Number(
                options && 'to' in options
                    ? options.to
                    : options && 'maxCount' in options && options.maxCount
                        ? options.from + options.maxCount
                        : events?.length ?? 1,
            );

            const resultEvents =
                events && events.length > 0
                    ? events.map((e) => e.event as EventType).slice(from, to)
                    : [];

            const result: ReadStreamResult<EventType> =
                events && events.length > 0
                    ? {
                        currentStreamVersion: currentStreamVersion!,
                        events: resultEvents,
                    }
                    : null;

            return Promise.resolve(result);
        },

        appendToStream: <EventType extends Event>(
            streamName: string,
            events: EventType[],
            options?: AppendToStreamOptions,
        ): Promise<AppendToStreamResult> => {
            const currentEvents = streams.get(streamName) ?? [];
            const currentStreamVersion =
                currentEvents.length > 0 ? BigInt(currentEvents.length) : undefined;

            assertExpectedVersionMatchesCurrent(
                currentStreamVersion,
                options?.expectedStreamVersion,
            );

            const eventEnvelopes: EventEnvelope[] = events.map((event, index) => {
                return {
                    event,
                    metadata: {
                        eventId: v4(),
                        streamPosition: currentEvents.length + index + 1,
                        logPosition: BigInt(getAllEventsCount() + index + 1),
                    },
                };
            });

            const positionOfLastEventInTheStream = BigInt(
                eventEnvelopes.slice(-1)[0]!.metadata.streamPosition,
            );

            streams.set(streamName, [...currentEvents, ...eventEnvelopes]);

            const result: AppendToStreamResult = {
                nextExpectedStreamVersion: positionOfLastEventInTheStream,
            };

            return Promise.resolve(result);
        },
    };
};
