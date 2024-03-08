package de.nebulit.todo.events

import de.nebulit.todo.common.Event
import java.time.LocalDate

data class TodoAddedEvent(var taskName:String, var startDate: LocalDate?, var resolvedDate:LocalDate?) : Event
