package de.nebulit.calculator.domain

import de.nebulit.calculator.common.AggregateRoot
import de.nebulit.calculator.common.persistence.InternalEvent
import de.nebulit.calculator.events.OperationGEsetztEvent
import de.nebulit.calculator.events.ResultCalculatedEvent
import de.nebulit.calculator.events.ZahlGesetztEvent
import de.nebulit.calculator.setzezahl.internal.SetzeZahlCommand
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.springframework.expression.spel.standard.SpelExpressionParser
import java.sql.Types
import java.time.LocalDate
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


    @PostLoad
    fun postLoad() {
        if (this.events == null) {
            this.events = mutableListOf()
        }
    }

    fun setzeNummer(zahl: Long) {
        // validierung
        this.events.add(InternalEvent().apply {
            this.aggregateId = this@CalculationAggregate.aggregateId
            this.value = ZahlGesetztEvent(zahl, this@CalculationAggregate.aggregateId)
        })
    }

    fun setzeOperation(operation: String) {
        this.events.add(InternalEvent().apply {
            this.aggregateId = this@CalculationAggregate.aggregateId
            this.value = OperationGEsetztEvent(operation, this@CalculationAggregate.aggregateId)
        })
    }

    fun calculate(zahl1: Long, zahl2: Long, operation: String) {
        val expressionParser = SpelExpressionParser()
        val result = expressionParser.parseExpression("$zahl1 $operation $zahl2").value as Int

        this.events.add(InternalEvent().apply {
            this.aggregateId = this@CalculationAggregate.aggregateId
            this.value = ResultCalculatedEvent(result.toLong(), this@CalculationAggregate.aggregateId)
        })
    }

    companion object {
        fun newSession(aggregateId: UUID): CalculationAggregate {
            return CalculationAggregate(aggregateId)
        }
    }
}
