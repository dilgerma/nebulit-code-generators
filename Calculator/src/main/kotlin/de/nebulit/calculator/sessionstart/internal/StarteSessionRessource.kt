package de.nebulit.calculator.sessionstart.internal

import de.nebulit.calculator.common.DelegatingCommandHandler
import de.nebulit.calculator.sessionstart.internal.StarteSessionCommand
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class SessionstartRessource(private var commandHandler: DelegatingCommandHandler) {



    @PostMapping("/sessionstart")
    fun processCommand(@RequestParam aggregateId:UUID) {
        commandHandler.handle(StarteSessionCommand(aggregateId))
    }
}
