package de.nebulit.eventsourcing.common

import de.nebulit.eventsourcing.common.persistence.InternalEvent
import java.util.*

interface AggregateRoot: EventState<AggregateRoot> {

    var version: Long?
    var events: MutableList<InternalEvent>
    var aggregateId: UUID

}
