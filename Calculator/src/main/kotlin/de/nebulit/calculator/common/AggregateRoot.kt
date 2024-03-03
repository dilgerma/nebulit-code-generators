package de.nebulit.calculator.common

import de.nebulit.calculator.common.persistence.InternalEvent
import java.util.*

interface AggregateRoot: EventState<AggregateRoot> {

    var version: Long?
    var events: MutableList<InternalEvent>
    var aggregateId: UUID

}
