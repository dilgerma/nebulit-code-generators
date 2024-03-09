package de.nebulit.todo.startsession

import de.nebulit.todo.ContainerConfiguration
import de.nebulit.todo.common.DelegatingCommandHandler
import de.nebulit.todo.common.persistence.EventsEntityRepository
import de.nebulit.todo.events.SessionStartedEvent
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.modulith.test.Scenario
import java.util.*

@ApplicationModuleTest(mode = ApplicationModuleTest.BootstrapMode.DIRECT_DEPENDENCIES)
@Import(ContainerConfiguration::class)
class AddTodoCommandCommandHandlerTest {

    @Autowired
    lateinit var repository: EventsEntityRepository
    @Autowired
    lateinit var commandHandler: DelegatingCommandHandler

    @Test
    fun shouldAddDepartmentsOnEvent(scenario: Scenario) {
        var aggregateId = UUID.randomUUID()
        scenario.stimulate { _ ->
            commandHandler.handle(StartSessionCommand("foo", aggregateId))
        }.andWaitForEventOfType(SessionStartedEvent::class.java)
            .matching { it.aggregateId == aggregateId && it.name == "foo" }.toArrive()
    }
}
