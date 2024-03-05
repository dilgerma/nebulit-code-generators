package de.nebulit.eventsourcing.common.persistence

import com.thoughtworks.xstream.XStream
import com.thoughtworks.xstream.converters.MarshallingContext
import com.thoughtworks.xstream.converters.UnmarshallingContext
import com.thoughtworks.xstream.io.HierarchicalStreamReader
import com.thoughtworks.xstream.io.HierarchicalStreamWriter
import jakarta.persistence.*
import org.apache.avro.specific.SpecificRecord
import org.hibernate.annotations.JdbcTypeCode
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.repository.CrudRepository
import java.nio.ByteBuffer
import java.nio.charset.StandardCharsets
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
    open var value: SpecificRecord? = null

    @Version
    open var version: Int? = null

    @CreatedDate
    open var created: LocalDateTime? = null

}

/**
 * Workaround.
 *
 * It would be desirable to use the External Converter in XStream.
 * Unfortunately there is a mismatch with an optimization
 * that direct binary decoder makes.
 * (if a long fits into an byte, it will render it as byte instead
 * of byte[], which results in a class cast exception).
 * Just remove the registration of this converter to see it in a Test Case.
 */
class XStreamAvroConverter : com.thoughtworks.xstream.converters.Converter {
    override fun canConvert(type: Class<*>?): Boolean {
        return SpecificRecord::class.java.isAssignableFrom(type)
    }

    override fun marshal(source: Any?, writer: HierarchicalStreamWriter?, context: MarshallingContext?) {
        var record = source as SpecificRecord
        var bytesResolver = record::class.java.getMethod("toByteBuffer")
        var bytes = bytesResolver.invoke(record) as ByteBuffer
        writer?.setValue(encodeByteBufferToBase64(bytes))
    }

    override fun unmarshal(reader: HierarchicalStreamReader?, context: UnmarshallingContext?): Any {
        val className = reader?.nodeName
        val clazz = Class.forName(className)
        var method = clazz.getMethod("fromByteBuffer", ByteBuffer::class.java)
        val record = clazz.getDeclaredConstructor().newInstance()
        return method.invoke(record, decodeBase64ToByteBuffer(reader?.value.toString()))
    }

    fun decodeBase64ToByteBuffer(encodedString: String): ByteBuffer {
        val base64Bytes = Base64.getDecoder().decode(encodedString)
        return ByteBuffer.wrap(base64Bytes)
    }

    private fun encodeByteBufferToBase64(byteBuffer: ByteBuffer): String {
        /**
         * just a hack. You would not do this in production.
         * In the training, we will look at how to apply the schema registry properly.
         */
        val byteArray = ByteArray(byteBuffer.remaining())
        byteBuffer.get(byteArray)

        val base64Bytes = Base64.getEncoder().encode(byteArray)
        return String(base64Bytes, StandardCharsets.UTF_8)
    }

}

@Converter
class XmlPayloadConverter : AttributeConverter<SpecificRecord?, String?> {

    var xStream = XStream()

    init {
        xStream.allowTypesByRegExp(listOf("de.nebulit.*").toTypedArray())
        xStream.registerConverter(XStreamAvroConverter())
    }

    override fun convertToDatabaseColumn(record: SpecificRecord?): String? {
        return xStream.toXML(record)
    }

    override fun convertToEntityAttribute(record: String?): SpecificRecord? {
        return xStream.fromXML(record) as SpecificRecord
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
