package de.nebulit.calculator.kalkulation.internal

import de.nebulit.calculator.common.DelegatingCommandHandler
import de.nebulit.calculator.kalkulation.internal.CalculateCommand
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class KalkulationRessource(private var commandHandler: DelegatingCommandHandler) {



    @PostMapping("/kalkulation")
    fun processCommand(@RequestParam zahl1:Long,@RequestParam zahl2:Long,@RequestParam operation:String,@RequestParam aggregateId:UUID) {
        commandHandler.handle(CalculateCommand(zahl1,zahl2,operation,aggregateId))
    }
}
