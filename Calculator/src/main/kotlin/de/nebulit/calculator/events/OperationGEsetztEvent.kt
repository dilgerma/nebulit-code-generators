package de.nebulit.calculator.events

import de.nebulit.calculator.common.Event
import java.util.UUID


data class OperationGEsetztEvent(var operation:String,var aggregateId:UUID) : Event
