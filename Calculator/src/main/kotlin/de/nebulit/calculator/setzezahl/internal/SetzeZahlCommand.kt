package de.nebulit.calculator.setzezahl.internal

import de.nebulit.calculator.common.Command
import java.util.UUID

data class SetzeZahlCommand(var zahl:Long,override var aggregateId:UUID) : Command
