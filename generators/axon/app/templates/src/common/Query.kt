package <%= rootPackageName%>.common

import org.springframework.stereotype.Component

interface Query

interface QueryHandler<T : Query, U> {
    fun handleQuery(query: T): U
}
