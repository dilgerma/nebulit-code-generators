package <%= rootPackageName%>.common

import java.util.UUID
import mu.KotlinLogging
import org.springframework.stereotype.Component

import <%= rootPackageName%>.common.persistence.InternalEvent

interface EventState<U>{
    fun applyEvents(events: List<InternalEvent>): U
}

interface ReadModel

