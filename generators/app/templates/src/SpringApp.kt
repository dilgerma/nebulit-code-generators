package <%= rootPackageName%>

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling

@EnableJpaRepositories
@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = ["<%= rootPackageName%>"])
class SpringApp

fun main(args: Array<String>) {
    runApplication<SpringApp>(*args)
}
