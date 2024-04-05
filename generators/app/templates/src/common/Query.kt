package <%= rootPackageName%>.common

import org.springframework.stereotype.Component

interface Query<T> {
    fun toParam(): T
}


interface QueryHandler<T,U:ReadModel<U>> {
    fun handleQuery(query:Query<T>): U
    fun <T> canHandle(query: Query<T>): Boolean
}

@Component
class DelegatingQueryHandler(val queryHandlers: List<QueryHandler<*,*>>) {

    fun <T, U:ReadModel<U>> handleQuery(query: Query<T>): U {
          val resolver = queryHandlers
              .filterIsInstance<QueryHandler<T, U>>()
              .first { it.canHandle(query) }
          return resolver.handleQuery(query)
      }
}
