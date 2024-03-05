package de.nebulit.testy.common

interface Processor<T>: EventState<T> {

    fun process()

}
