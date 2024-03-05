package de.nebulit.eventsourcing.common

import java.util.*

interface Command {
    var aggregateId: UUID
}
