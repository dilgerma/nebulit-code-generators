package <%= rootPackageName%>

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling

@Modulith(
        systemName = "System",
        sharedModules =["<%= rootPackageName%>.support","<%= rootPackageName%>.domain"],
        useFullyQualifiedModuleNames = true
)
@EnableJpaRepositories
@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = ["<%= rootPackageName%>", "org.springframework.modulith.events.jpa"])
class SpringApp {
    companion object {
        fun main(args: Array<String>) {
            runApplication<SpringApp>(*args)
        }

    }
}

