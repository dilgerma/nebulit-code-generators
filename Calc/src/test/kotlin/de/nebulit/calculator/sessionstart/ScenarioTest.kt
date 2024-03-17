package de.nebulit.calculator.sessionstart

import de.nebulit.calculator.ContainerConfiguration
import de.nebulit.calculator.common.CommandException

import de.nebulit.calculator.common.DelegatingCommandHandler
import de.nebulit.calculator.common.persistence.EventsEntityRepository
import de.nebulit.calculator.support.CalculationAggregateRepository

import de.nebulit.calculator.sessionstart.internal.StarteSessionCommand;
import de.nebulit.calculator.events.SessionStartedEvent
import java.util.UUID
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Assertions

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import de.nebulit.calculator.common.support.RandomData
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.modulith.test.Scenario
import java.util.*

@ApplicationModuleTest(mode = ApplicationModuleTest.BootstrapMode.DIRECT_DEPENDENCIES)
@Import(ContainerConfiguration::class)
class ScenarioTest {

    @Autowired
    lateinit var repository: EventsEntityRepository
    @Autowired
    lateinit var commandHandler: DelegatingCommandHandler
    @Autowired
    lateinit var aggregateRepository: CalculationAggregateRepository

    @BeforeEach
    fun setUp() {
        aggregateRepository.save(RandomData.newInstance(listOf("events")) {
            this.aggregateId = UUID.fromString("65527e39-cb86-4502-aef4-19ed0137e8e1")
            this.events = mutableListOf()
        })
    }

    @Test
    fun `ScenarioTest`(scenario: Scenario) {

        //GIVEN


        //WHEN
        var whenResult = scenario.stimulate { _ ->
                  commandHandler.handle(StarteSessionCommand(	aggregateId = UUID.fromString("65527e39-cb86-4502-aef4-19ed0137e8e1")))}

        //THEN
        whenResult.andWaitForEventOfType(SessionStartedEvent::class.java)
                        .toArrive()
    }

}
