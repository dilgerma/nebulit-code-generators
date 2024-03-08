package de.nebulit.todo.slices.addtodo

import de.nebulit.todo.common.Command
import java.util.UUID

data class AddTodoCommand(override var aggregateId: UUID, var taskName:String,var startDate:String,var endDate:String) : Command
