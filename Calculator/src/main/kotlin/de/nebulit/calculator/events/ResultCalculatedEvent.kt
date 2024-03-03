package de.nebulit.calculator.events

import de.nebulit.calculator.common.Event
import java.util.UUID


data class ResultCalculatedEvent(var result:Long,var aggregateId:UUID) : Event
