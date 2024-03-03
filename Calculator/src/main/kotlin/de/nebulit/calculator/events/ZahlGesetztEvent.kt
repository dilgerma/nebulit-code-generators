package de.nebulit.calculator.events

import de.nebulit.calculator.common.Event
import java.util.UUID


data class ZahlGesetztEvent(var zahl:Long,var aggregateId:UUID) : Event
