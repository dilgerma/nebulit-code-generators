package <%= rootPackageName%>.common

import <%= rootPackageName%>.common.persistence.InternalEvent

interface EventState<U>{
    fun applyEvents(events: List<InternalEvent>): U
}

interface ReadModel<U>: EventState<U>

interface ProcessorReadModel<U>: ReadModel<U>
