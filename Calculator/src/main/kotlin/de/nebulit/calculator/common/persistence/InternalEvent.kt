package de.nebulit.calculator.common.persistence

import com.thoughtworks.xstream.XStream
import de.nebulit.calculator.common.Event
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.CreationTimestamp
import org.springframework.data.repository.CrudRepository
import java.sql.Types
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "events")
open class InternalEvent {

    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "seq"

    )
    @SequenceGenerator(name = "seq", sequenceName = "events_seq", allocationSize = 1)
    @Id
    open var id: Long? = null

    @JdbcTypeCode(Types.VARCHAR)
    @Column(name = "aggregate_id")
    open lateinit var aggregateId: UUID

    @Convert(converter = XmlPayloadConverter::class)
    open var value: Event? = null

    @Version
    open var version: Int? = null

    @CreationTimestamp
    open var created: LocalDateTime? = null

}

@Converter
class XmlPayloadConverter : AttributeConverter<Event?, String?> {

    var xStream = XStream()

    init {
        xStream.allowTypesByRegExp(listOf("de.nebulit.calculator.*").toTypedArray())
    }

    override fun convertToDatabaseColumn(record: Event?): String? {
        return xStream.toXML(record)
    }

    override fun convertToEntityAttribute(record: String?): Event? {
        return xStream.fromXML(record) as Event
    }

}

interface EventsEntityRepository : CrudRepository<InternalEvent, Long> {
    fun findByAggregateId(id: UUID): List<InternalEvent>

    fun findByAggregateIdAndIdGreaterThanOrderByIdAsc(aggregateId: UUID, id: Long): List<InternalEvent>

    fun findAllByCreatedBetween(start: LocalDateTime, end: LocalDateTime): List<InternalEvent>
    fun findByAggregateIdAndCreatedBetween(aggregateId: UUID,start: LocalDateTime, end: LocalDateTime): List<InternalEvent>

    fun countByAggregateIdAndIdGreaterThanOrderByIdAsc(aggregateId: UUID, id: Long): Long
    fun countByAggregateId(aggregateId: UUID): Long
}
