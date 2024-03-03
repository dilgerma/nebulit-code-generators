package de.nebulit.calculator.kalkulation.internal

import de.nebulit.calculator.common.Command
import java.util.UUID

data class CalculateCommand(var zahl1:Long,var zahl2:Long,var operation:String,override var aggregateId:UUID) : Command
