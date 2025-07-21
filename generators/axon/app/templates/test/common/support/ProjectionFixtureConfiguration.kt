/* (C)2024 */
package <

%= rootPackageName%>.common.support

import < %= rootPackageName%>.common.Event
import org.axonframework.messaging.unitofwork.DefaultUnitOfWork
import org.axonframework.modelling.command.Aggregate
import org.axonframework.modelling.command.AggregateLifecycle
import org.axonframework.modelling.command.AggregateNotFoundException

class ProjectionFixtureConfiguration<T> {
    private lateinit var aggregateFactory: () -> Aggregate<T>
    private val given = mutableListOf<Event>()

    private fun newInstance(factory: () -> Aggregate<T>): ProjectionFixtureConfiguration<T> {
        this.aggregateFactory = factory
        return this
    }

    fun reset() {
        this.given.clear()
    }

    fun given(vararg events: Event) {
        this.given.addAll(events)
    }

    fun apply() {
        var unitOfWork = DefaultUnitOfWork.startAndGet(null)
        val aggregate =
            try {
                aggregateFactory()
            } catch (e: AggregateNotFoundException) {
                // Wait for 1 second and retry
                Thread.sleep(1000)
                aggregateFactory()
            }

        aggregate.execute { given.forEach { AggregateLifecycle.apply(it) } }

        unitOfWork.commit()
    }

    companion object {
        fun <T> aggregateInstance(factory: () -> Aggregate<T>): ProjectionFixtureConfiguration<T> {
            val projectionFixtureConfiguration = ProjectionFixtureConfiguration<T>()
            projectionFixtureConfiguration.newInstance(factory)
            return projectionFixtureConfiguration
        }
    }
}
