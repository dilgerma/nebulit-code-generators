package <%= _rootPackageName%>.<%=_slice%>

import <%= _rootPackageName%>.ContainerConfiguration
import <%= _rootPackageName%>.common.CommandException

import <%= _rootPackageName%>.common.DelegatingCommandHandler
import <%= _rootPackageName%>.common.DelegatingQueryHandler
import <%= _rootPackageName%>.common.persistence.EventsEntityRepository
import <%= _rootPackageName%>.support.<%=_aggregate%>Repository
import <%= _rootPackageName%>.common.persistence.InternalEvent


<%= _elementImports%>
<%= _typeImports%>
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import <%= _rootPackageName%>.common.support.RandomData
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.modulith.test.Scenario
import java.util.*

@ApplicationModuleTest(mode = ApplicationModuleTest.BootstrapMode.DIRECT_DEPENDENCIES)
@Import(ContainerConfiguration::class)
class <%=_name%> {

    @Autowired
    lateinit var repository: EventsEntityRepository
    @Autowired
    lateinit var commandHandler: DelegatingCommandHandler
    @Autowired
    lateinit var queryHandler: DelegatingQueryHandler
    @Autowired
    lateinit var aggregateRepository: <%=_aggregate%>Repository

    @BeforeEach
    fun setUp() {
        aggregateRepository.save(RandomData.newInstance(listOf("events")) {
            this.aggregateId = AGGREGATE_ID
            this.events = mutableListOf()
        })
    }

    @Test
    fun `<%=_name%>`(scenario: Scenario) {

       var whenResult = prepare(scenario)

       //THEN
    <%-_then%>
    }

    private fun prepare(scenario: Scenario): Scenario.When<Void> {
      return scenario.stimulate { stimulus, eventPublisher ->
                    run {
                        stimulus.executeWithoutResult {
                            //GIVEN
                            <%-_given%>
                            //WHEN
                            <%-_when%>
                        }
                    }}
    }

    companion object {
        var AGGREGATE_ID = UUID.fromString("<%=_aggregateId%>")
    }

}
