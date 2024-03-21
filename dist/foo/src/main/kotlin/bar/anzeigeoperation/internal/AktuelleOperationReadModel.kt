package bar.anzeigeoperation.internal

import bar.common.ReadModel
import bar.common.persistence.InternalEvent
import java.util.*



class AktuelleOperationReadModel : ReadModel<AktuelleOperationReadModel> {

	var operation:String? = null;

    override fun applyEvents(events: List<InternalEvent>): AktuelleOperationReadModel {
        events.forEach({
            when(it.value) {
                //TODO
                // is Event -> {}
            }
        })
        return this
    }

}



