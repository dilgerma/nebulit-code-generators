package de.nebulit.calculator.sessionstart.internal

import de.nebulit.calculator.common.Command
import java.util.UUID

data class StarteSessionCommand(override var aggregateId:UUID) : Command
