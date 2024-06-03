package <%= rootPackageName%>.common

import java.time.LocalDateTime

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

interface Event
