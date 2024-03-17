package de.nebulit.calculator

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.modulith.Modulith

@Modulith(
        systemName = "System",
        sharedModules =["de.nebulit.calculator.support","de.nebulit.calculator.domain"],
        useFullyQualifiedModuleNames = true
)
@EnableJpaRepositories
@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = ["de.nebulit.calculator", "org.springframework.modulith.events.jpa"])
class SpringApp {
    companion object {
        fun main(args: Array<String>) {
            runApplication<SpringApp>(*args)
        }

    }
}

