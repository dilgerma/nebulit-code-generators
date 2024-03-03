package de.nebulit.calculator.kalkulation

import de.nebulit.calculator.ContainerConfiguration
import de.nebulit.calculator.common.DelegatingCommandHandler
import de.nebulit.calculator.common.persistence.EventsEntityRepository
import de.nebulit.calculator.kalkulation.internal.CalculateCommand;
import de.nebulit.calculator.events.ResultCalculatedEvent
import java.util.UUID
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import de.nebulit.calculator.common.support.RandomData
import de.nebulit.calculator.support.CalculationAggregateRepository
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.modulith.test.Scenario
import java.util.*

@ApplicationModuleTest(mode = ApplicationModuleTest.BootstrapMode.DIRECT_DEPENDENCIES)
@Import(ContainerConfiguration::class)
class KalkulationTest {

    @Autowired
    lateinit var repository: EventsEntityRepository

    @Autowired
    lateinit var commandHandler: DelegatingCommandHandler

    @Autowired
    lateinit var aggregateRepository: CalculationAggregateRepository

    @Test
    fun shouldAddDepartmentsOnEvent(scenario: Scenario) {

        aggregateRepository.save(RandomData.newInstance(listOf("events")) {
            this.aggregateId = UUID.fromString("fa5cabe4-dbaf-4205-8b3b-fb0d1c8bb7f8")
        })


        //GIVEN


        //WHEN
        var whenResult = scenario.stimulate { _ ->
            commandHandler.handle(
                CalculateCommand(
                    zahl1 = 5,
                    zahl2 = 3,
                    operation = "*",
                    aggregateId = UUID.fromString("fa5cabe4-dbaf-4205-8b3b-fb0d1c8bb7f8")
                )
            )
        }

        //THEN
        whenResult.andWaitForEventOfType(ResultCalculatedEvent::class.java)
            .matching { it.result == 16L && it.aggregateId == UUID.fromString("fa5cabe4-dbaf-4205-8b3b-fb0d1c8bb7f8") }
            .toArrive()
    }

}
