package de.nebulit.eventsourcing.challenge.debug

import de.nebulit.eventsourcing.common.ReadModel
import de.nebulit.eventsourcing.common.persistence.InternalEvent


data class Event(var id: Long, var type: String?)
class DebugEventsReadModel : ReadModel<DebugEventsReadModel> {

    var events: MutableList<Event> = mutableListOf()
    override fun applyEvents(events: List<InternalEvent>): DebugEventsReadModel {
        events.forEach {
            this.events.add(Event(it.id?:0, it.value?.javaClass?.simpleName))
        }
        return this
    }
}