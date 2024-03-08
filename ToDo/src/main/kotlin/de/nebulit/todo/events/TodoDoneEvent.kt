package de.nebulit.todo.events

import de.nebulit.todo.common.Event
import java.util.UUID

data class TodoDoneEvent(var taskName:String) : Event
