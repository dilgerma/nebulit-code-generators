package de.nebulit.testy.common

import de.nebulit.testy.common.persistence.InternalEvent
import java.util.*

interface AggregateRoot: EventState<AggregateRoot> {

    var version: Long?
    var events: MutableList<InternalEvent>
    var aggregateId: UUID

}
