package <%= rootPackageName%>.common

interface Processor<T>: EventState<T> {

    fun process()

}
