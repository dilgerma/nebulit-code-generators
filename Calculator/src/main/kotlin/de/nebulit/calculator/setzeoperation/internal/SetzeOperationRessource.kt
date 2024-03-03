package de.nebulit.calculator.setzeoperation.internal

import de.nebulit.calculator.common.DelegatingCommandHandler
import de.nebulit.calculator.setzeoperation.internal.SetzeOperationCommand
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class SetzeOperationRessource(private var commandHandler: DelegatingCommandHandler) {



    @PostMapping("/setze-operation")
    fun processCommand(@RequestParam operation:String,@RequestParam aggregateId:UUID) {
        commandHandler.handle(SetzeOperationCommand(operation,aggregateId))
    }
}
