/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

import {EventEnvelope} from "@event-driven-io/emmett";

export type Subscriber = {
    streamId?:string
    on(streamId: string, event: EventEnvelope[]):void;
}