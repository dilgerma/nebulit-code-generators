package de.nebulit.calculator.kalkulation.internal

import de.nebulit.calculator.common.*
import de.nebulit.calculator.common.persistence.InternalEvent
import org.springframework.stereotype.Component
import org.springframework.context.ApplicationEventPublisher
import de.nebulit.calculator.domain.CalculationAggregate
import java.util.UUID


@Component
class CalculateCommandCommandHandler(
    private var aggregateService: AggregateService<CalculationAggregate>,
    private var applicationEventPublisher: ApplicationEventPublisher
) : BaseCommandHandler<CalculationAggregate>(aggregateService) {

    override fun handle(inputCommand: Command): List<InternalEvent> {
        assert(inputCommand is CalculateCommand)
        val command = inputCommand as CalculateCommand
        val aggregate = findAggregate(command.aggregateId)
        aggregate.calculate(inputCommand.zahl1, inputCommand.zahl2, inputCommand.operation)
        aggregateService.persist(aggregate)
        aggregate.events.forEach {
             applicationEventPublisher.publishEvent(it.value as Any)
        }
        return aggregate.events
    }

    override fun supports(command: Command): Boolean {
        return command is CalculateCommand
    }

}
