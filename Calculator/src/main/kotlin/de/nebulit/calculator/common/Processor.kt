package de.nebulit.calculator.common

interface Processor<T>: EventState<T> {

    fun process()

}
