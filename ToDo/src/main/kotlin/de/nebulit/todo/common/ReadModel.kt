package de.nebulit.todo.common

import de.nebulit.todo.common.persistence.InternalEvent

interface EventState<U>{
    fun applyEvents(events: List<InternalEvent>): U
}

interface ReadModel<U>: EventState<U>

interface ProcessorReadModel<U>: ReadModel<U>
