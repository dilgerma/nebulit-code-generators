package de.nebulit.calculator.domain

import de.nebulit.calculator.common.AggregateRoot
import de.nebulit.calculator.common.persistence.InternalEvent
import de.nebulit.calculator.events.SessionStartedEvent
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import java.sql.Types
import java.util.*
import kotlin.jvm.Transient

@Entity
@Table(name = "aggregates")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "Discriminator", discriminatorType = DiscriminatorType.STRING, length = 20)
@DiscriminatorValue("CalculationAggregate")
class CalculationAggregate(
    @JdbcTypeCode(Types.VARCHAR) @Id override var aggregateId: UUID
) : AggregateRoot {

    override var version: Long? = 0

    @Transient
    override var events: MutableList<InternalEvent> = mutableListOf()

    override fun applyEvents(events: List<InternalEvent>): AggregateRoot {
        return this
    }

    private fun startSession() {
        this.events.add(InternalEvent().apply {
            this.aggregateId = this@CalculationAggregate.aggregateId
            this.value = SessionStartedEvent(this@CalculationAggregate.aggregateId)
        })
    }

    companion object {
        fun newSession(): CalculationAggregate {
            var aggregate = CalculationAggregate(UUID.randomUUID())
            aggregate.startSession()
            return aggregate
        }
    }
}
