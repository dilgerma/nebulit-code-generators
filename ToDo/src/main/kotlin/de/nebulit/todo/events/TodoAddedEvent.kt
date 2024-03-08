package de.nebulit.todo.events

import de.nebulit.todo.common.Event
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.UUID


data class TodoAddedEvent(var taskName:String,var createdDate:LocalDate,var aggregateId:UUID) : Event
