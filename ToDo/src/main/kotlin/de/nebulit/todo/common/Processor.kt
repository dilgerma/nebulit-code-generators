package de.nebulit.todo.common

interface Processor<T>: EventState<T> {

    fun process()

}
