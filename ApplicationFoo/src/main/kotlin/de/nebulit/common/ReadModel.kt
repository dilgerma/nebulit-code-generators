package de.nebulit.common

import de.nebulit.common.persistence.InternalEvent

interface EventState<U>{
    fun applyEvents(events: List<InternalEvent>): U
}

interface ReadModel<U>: EventState<U>

interface ProcessorReadModel<U>: ReadModel<U>
