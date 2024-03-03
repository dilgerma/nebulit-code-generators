package de.nebulit.calculator.setzezahl.internal

import de.nebulit.calculator.common.DelegatingCommandHandler
import de.nebulit.calculator.setzezahl.internal.SetzeZahlCommand
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class SetzezahlRessource(private var commandHandler: DelegatingCommandHandler) {



    @PostMapping("/setzezahl")
    fun processCommand(@RequestParam zahl:Long,@RequestParam aggregateId:UUID) {
        commandHandler.handle(SetzeZahlCommand(zahl,aggregateId))
    }
}
