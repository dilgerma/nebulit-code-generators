package de.nebulit.calculator.setzezahl

import de.nebulit.calculator.ContainerConfiguration
import de.nebulit.calculator.common.DelegatingCommandHandler
import de.nebulit.calculator.common.persistence.EventsEntityRepository
import de.nebulit.calculator.events.SessionStartedEvent;
import de.nebulit.calculator.setzezahl.internal.SetzeZahlCommand;
import de.nebulit.calculator.events.ZahlGesetztEvent
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
class SetzeZahlTest {

    @Autowired
    lateinit var repository: EventsEntityRepository

    @Autowired
    lateinit var commandHandler: DelegatingCommandHandler

    @Autowired
    lateinit var aggregateRepository: CalculationAggregateRepository

    @Test
    fun `Spec SetzeZahl`(scenario: Scenario) {
        aggregateRepository.save(RandomData.newInstance(listOf("events")) {
            this.aggregateId = UUID.fromString("fa5cabe4-dbaf-4205-8b3b-fb0d1c8bb7f8")
        })

        //GIVEN
        repository.save(RandomData.newInstance(listOf("value")) {
            this.value = SessionStartedEvent(
                aggregateId = UUID.fromString("fa5cabe4-dbaf-4205-8b3b-fb0d1c8bb7f8")
            )
        })


        //WHEN
        var whenResult = scenario.stimulate { _ ->
            commandHandler.handle(
                SetzeZahlCommand(
                    zahl = 5,
                    aggregateId = UUID.fromString("fa5cabe4-dbaf-4205-8b3b-fb0d1c8bb7f8")
                )
            )
        }

        //THEN
        whenResult.andWaitForEventOfType(ZahlGesetztEvent::class.java)
            .matching { it.zahl == 5L && it.aggregateId == UUID.fromString("fa5cabe4-dbaf-4205-8b3b-fb0d1c8bb7f8") }
            .toArrive()
    }

}
