package de.nebulit.calculator.support

import de.nebulit.calculator.common.AggregateService
import de.nebulit.calculator.common.persistence.EventsEntityRepository
import de.nebulit.calculator.common.persistence.InternalEvent
import de.nebulit.calculator.domain.CalculationAggregate
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface CalculationAggregateRepository : CrudRepository<CalculationAggregate, Long> {
    fun findByAggregateId(aggregateId: UUID): CalculationAggregate?
}


@Component
class CalculationAggregateService(
    var repository: CalculationAggregateRepository,
    var eventsEntityRepository: EventsEntityRepository,
) : AggregateService<CalculationAggregate> {

    @Transactional
    override fun persist(aggregate: CalculationAggregate) {
        repository.save(aggregate)
        if (aggregate.events!= null && aggregate.events.isNotEmpty()) {
            eventsEntityRepository.saveAll(aggregate.events)
        }
    }

    override fun findByAggregateId(aggregateId: UUID): CalculationAggregate? {
        return repository.findByAggregateId(aggregateId)
    }

    override fun findEventsByAggregateId(aggregateId: UUID): List<InternalEvent> {
        return  eventsEntityRepository.findByAggregateIdAndIdGreaterThanOrderByIdAsc(
            aggregateId, 0)
    }

}
