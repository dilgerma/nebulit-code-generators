package de.nebulit.calculator.events

import de.nebulit.calculator.common.Event
import java.util.UUID


data class SessionStartedEvent(var aggregateId:UUID) : Event
