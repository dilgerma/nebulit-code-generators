package de.nebulit.calculator.setzezahl.internal

import de.nebulit.calculator.common.*
import de.nebulit.calculator.common.persistence.InternalEvent
import org.springframework.stereotype.Component
import org.springframework.context.ApplicationEventPublisher
import de.nebulit.calculator.domain.CalculationAggregate
import java.util.UUID


@Component
class SetzeZahlCommandCommandHandler(
    private var aggregateService: AggregateService<CalculationAggregate>,
    private var applicationEventPublisher: ApplicationEventPublisher
) : BaseCommandHandler<CalculationAggregate>(aggregateService) {

    override fun handle(inputCommand: Command): List<InternalEvent> {
        assert(inputCommand is SetzeZahlCommand)
        val command = inputCommand as SetzeZahlCommand
        val aggregate = findAggregate(command.aggregateId)
        aggregate.setzeNummer(command.zahl)
        aggregateService.persist(aggregate)
        aggregate.events.forEach {
             applicationEventPublisher.publishEvent(it.value as Any)
        }
        return aggregate.events
    }

    override fun supports(command: Command): Boolean {
        return command is SetzeZahlCommand
    }

}
