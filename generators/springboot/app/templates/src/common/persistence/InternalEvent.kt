package de.mebulit.common.persistence

import com.thoughtworks.xstream.XStream
import de.mebulit.common.Event
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.CreationTimestamp
import org.springframework.data.repository.CrudRepository
import java.sql.Types
import java.time.LocalDateTime
import java.util.*

interface EventMetaData {
    val causationId: String?
    val correlationId: String?
    val creationDate: LocalDateTime?
    val additionAttributes: Map<String, String>
}

data class DefaultEventMetaData(
    override val causationId: String? = null,
    override val correlationId: String? = null,
    override val creationDate: LocalDateTime? = LocalDateTime.now(),
    override var additionAttributes: MutableMap<String, String>
) : EventMetaData {

    companion object {
        fun empty(): EventMetaData {
            return DefaultEventMetaData(null, null, LocalDateTime.now(), mutableMapOf())
        }
    }

}

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
    @Column(name="value")
    open var value: Event? = null

    @Convert(converter = XmlMetaDataConverter::class)
    @Column(name="metadata")
    open var metaData: EventMetaData? = DefaultEventMetaData.empty()

    @Version
    open var version: Int? = null

    @CreationTimestamp
    open var created: LocalDateTime? = null

}

@Converter
class XmlPayloadConverter : AttributeConverter<Event?, String?> {

    var xStream = XStream()

    init {
        xStream.allowTypesByRegExp(listOf("de.mebulit.*").toTypedArray())
    }

    override fun convertToDatabaseColumn(record: Event?): String? {
        return xStream.toXML(record)
    }

    override fun convertToEntityAttribute(record: String?): Event? {
        return xStream.fromXML(record) as Event
    }

}

@Converter
class XmlMetaDataConverter : AttributeConverter<EventMetaData?, String?> {

    var xStream = XStream()

    init {
        xStream.allowTypesByRegExp(listOf("de.mebulit.*").toTypedArray())
    }

    override fun convertToDatabaseColumn(record: EventMetaData?): String? {
        return xStream.toXML(record)
    }

    override fun convertToEntityAttribute(record: String?): EventMetaData? {
        return xStream.fromXML(record) as EventMetaData
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
