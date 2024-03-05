package de.nebulit.eventsourcing.challenge

import de.nebulit.eventsourcing.common.AggregateService
import de.nebulit.eventsourcing.challenge.persistence.GoalRepository
import de.nebulit.eventsourcing.common.persistence.EventsEntityRepository
import de.nebulit.eventsourcing.common.persistence.EventsSnapshotRepository
import de.nebulit.eventsourcing.common.persistence.InternalEvent
import de.nebulit.eventsourcing.common.persistence.InternalEventSnapshot
import de.nebulit.eventsourcing.challenge.domain.Challenge
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class ChallengeAggregateService(
    var challengeRepository: GoalRepository,
    var eventsEntityRepository: EventsEntityRepository,
    var eventsSnapshotRepository: EventsSnapshotRepository
) : AggregateService<Challenge> {

    @Transactional
    override fun persist(challenge: Challenge) {
        challengeRepository.save(challenge)
        eventsEntityRepository.saveAll(challenge.events)

        /*
        val latestSnapshot = eventsSnapshotRepository.findFirstByAggregateIdOrderByIdDesc(challenge.aggregateId)

        val lastSnapshottedEventByAggregate = latestSnapshot?.events?.last()?.id ?: 0
        if (eventsEntityRepository.countByAggregateIdAndIdGreaterThanOrderByIdAsc(
                challenge.aggregateId,
                lastSnapshottedEventByAggregate
            ) >= 1000
        ) {
            val eventsSinceLastSnapshot = eventsEntityRepository.findByAggregateIdAndIdGreaterThanOrderByIdAsc(
                challenge.aggregateId,
                lastSnapshottedEventByAggregate
            )

            eventsSnapshotRepository.save(InternalEventSnapshot().apply {
                this.events = eventsSinceLastSnapshot
                this.aggregateId = challenge.aggregateId
            })


        }*/

    }

    override fun findByAggregateId(aggregateId: UUID): Challenge? {
        return challengeRepository.findByAggregateId(aggregateId)
    }

    override fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent> {
        val snapshots = eventsSnapshotRepository.findByAggregateId(aggregateId)
        val events = eventsEntityRepository.findByAggregateIdAndIdGreaterThanOrderByIdAsc(
            aggregateId, snapshots.lastOrNull()?.events?.last()?.id
                ?: 0
        )
        val allEvents =
            if (snapshots.isNotEmpty()) snapshots.map { it.events }.reduce { acc, list -> acc + list } else emptyList()
        return allEvents + events
    }

}
