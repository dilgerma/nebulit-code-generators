package de.nebulit.eventsourcing.challenge.debug

import de.nebulit.eventsourcing.challenge.domain.Challenge
import de.nebulit.eventsourcing.common.AggregateRoot
import de.nebulit.eventsourcing.common.AggregateService
import de.nebulit.eventsourcing.common.persistence.InternalEvent
import org.hibernate.Internal
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.config.BeanDefinition
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Scope
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

// stateful debug component
@Component
class RemoteControl() {

    private var state: List<InternalEvent> = emptyList()
    private var currentOffset: Int = 0
    private var aggregateId: UUID? = null

    fun start(aggregateId: UUID, events: List<InternalEvent>) {
        state = events
        this.aggregateId = aggregateId
        currentOffset = state.size
    }

    fun update(events: List<InternalEvent>) {
        this.state = events
    }

    fun isChannel(aggregateId: UUID): Boolean {
        return aggregateId == this.aggregateId
    }

    fun next(aggregateId: UUID) {
        if (isChannel(aggregateId)) {
            if (currentOffset <= state.size) currentOffset++
        }
    }

    fun prev(aggregateId: UUID) {
        if (isChannel(aggregateId)) {
            if (currentOffset >= 1) currentOffset--
        }

    }

    fun current(aggregateId: UUID): List<InternalEvent> {
        return if (isChannel(aggregateId)) state.take(currentOffset) else emptyList()
    }

    fun stop() {
        state = emptyList()
        aggregateId = null
        currentOffset = 0
    }


}

@Component
@Primary
class DebugAggregateService(
    var remoteControl: RemoteControl,
    var aggregateService: AggregateService<Challenge>
) : AggregateService<Challenge> {


    override fun persist(aggregate: Challenge) {
        aggregateService.persist(aggregate)
        if (remoteControl.isChannel(aggregate.aggregateId)) {
            remoteControl.update(aggregateService.findEventsByAggregateId(aggregate.aggregateId))
        }
    }

    override fun findByAggregateId(aggregateId: UUID): Challenge? {
        return aggregateService.findByAggregateId(aggregateId)
    }

    override fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent> {
        return if (remoteControl.isChannel(aggregateId)) {
            remoteControl.current(aggregateId)
        } else {
            aggregateService.findEventsByAggregateId(aggregateId)
        }
    }
}

@RestController
class RemoteControlEndpoint(
    var remoteControl: RemoteControl,
    var aggregateService: AggregateService<Challenge>
) {

    @PostMapping(start)
    fun activateChannel(@PathVariable aggregateId: UUID) {
        remoteControl.start(aggregateId, aggregateService.findEventsByAggregateId(aggregateId))
    }

    @PostMapping(stop)
    fun deactivateChannel(@PathVariable aggregateId: UUID) {
        remoteControl.stop()
    }

    @PostMapping(next)
    fun next(@PathVariable aggregateId: UUID) {
        remoteControl.next(aggregateId)
    }

    @PostMapping(prev)
    fun prev(@PathVariable aggregateId: UUID) {
        remoteControl.prev(aggregateId)
    }

    companion object {
        const val start: String = "/challenge/debug/remote/{aggregateId}/start"
        const val stop: String = "/challenge/debug/remote/{aggregateId}/stop"
        const val next: String = "/challenge/debug/remote/{aggregateId}/next"
        const val prev: String = "/challenge/debug/remote/{aggregateId}/prev"
    }

}
