package de.nebulit.calculator.setzeoperation.internal

import de.nebulit.calculator.common.Command
import java.util.UUID

data class SetzeOperationCommand(var operation:String,override var aggregateId:UUID) : Command
