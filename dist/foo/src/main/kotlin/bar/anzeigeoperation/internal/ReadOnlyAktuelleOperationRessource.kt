package bar.anzeigeoperation.internal

import bar.common.DelegatingCommandHandler
import bar.anzeigeoperation.internal.AktuelleOperationReadModel
import bar.common.persistence.EventsEntityRepository
import bar.common.ReadModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping

import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController


@RestController
class AnzeigeoperationRessource(private var repository: EventsEntityRepository) {

    @GetMapping("/anzeigeoperation")
    fun findInformation():ReadModel<AktuelleOperationReadModel> {
        return AktuelleOperationReadModel().applyEvents(repository.findByAggregateId(aggregateId))
        
    }
      

}
