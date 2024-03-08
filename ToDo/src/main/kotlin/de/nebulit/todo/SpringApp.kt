package de.nebulit.todo

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling

@EnableJpaRepositories
@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = ["de.nebulit.todo"])
class SpringApp {
    companion object {
        fun main(args: Array<String>) {
            runApplication<SpringApp>(*args)
        }

    }
}

