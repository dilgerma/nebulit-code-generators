package <%= rootPackageName%>.common

import <%= rootPackageName%>.common.persistence.InternalEvent
import java.util.*

interface AggregateRoot: EventState<AggregateRoot> {

    var version: Long?
    var events: MutableList<InternalEvent>
    var aggregateId: UUID

}
