package de.nebulit.todo.addtodo

import de.nebulit.todo.common.Command
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.UUID

data class AddTodoCommand(var taskName:String,var createdDate:LocalDate,override var aggregateId:UUID) : Command
