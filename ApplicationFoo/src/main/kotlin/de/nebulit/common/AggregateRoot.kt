package de.nebulit.common

import de.nebulit.common.persistence.InternalEvent
import java.util.*

interface AggregateRoot: EventState<AggregateRoot> {

    var version: Long?
    var events: MutableList<InternalEvent>
    var aggregateId: UUID

}
