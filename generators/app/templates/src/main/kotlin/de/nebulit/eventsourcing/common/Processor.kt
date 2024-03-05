package de.nebulit.eventsourcing.common

interface Processor<T>: EventState<T> {

    fun process()

}
