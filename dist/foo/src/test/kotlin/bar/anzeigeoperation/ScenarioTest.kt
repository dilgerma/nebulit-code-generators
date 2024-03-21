package bar.anzeigeoperation

import bar.ContainerConfiguration
import bar.common.CommandException

import bar.common.DelegatingCommandHandler
import bar.common.persistence.EventsEntityRepository
import bar.support.CalculationAggregateRepository

import bar.events.OperationGEsetztEvent;
import bar.anzeigeoperation.internal.AktuelleOperationReadModel
import java.util.UUID
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Assertions

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import bar.common.support.RandomData
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
            this.aggregateId = UUID.fromString("18a50281-3d9e-4628-98f4-cb0ccf944d0b")
            this.events = mutableListOf()
        })
    }

    @Test
    fun `ScenarioTest`(scenario: Scenario) {

        //GIVEN
    
         repository.save(RandomData.newInstance(listOf("value")) {
                	aggregateId = UUID.fromString("18a50281-3d9e-4628-98f4-cb0ccf944d0b")
                this.value = OperationGEsetztEvent(
                    	operation = RandomData.newInstance {  },
	aggregateId = UUID.fromString("18a50281-3d9e-4628-98f4-cb0ccf944d0b")
                )
            })
        

        //WHEN
    

        //THEN
    	var readModel = AktuelleOperationReadModel().applyEvents(repository.findByAggregateId(AGGREGATE_ID))
    }

    companion object {
        var AGGREGATE_ID = UUID.fromString("18a50281-3d9e-4628-98f4-cb0ccf944d0b")
    }

}
