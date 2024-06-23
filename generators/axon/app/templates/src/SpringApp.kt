package <%= rootPackageName%>

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.modulith.Modulith
import org.axonframework.commandhandling.CommandBus
import org.axonframework.commandhandling.CommandMessage
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.commandhandling.gateway.DefaultCommandGateway
import org.axonframework.messaging.MessageDispatchInterceptor
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AxonConfig {
    @Bean
    fun commandGateway(
        commandBus: CommandBus?,
        dispatchInterceptors: List<MessageDispatchInterceptor<CommandMessage<*>>>
    ): CommandGateway {
        return DefaultCommandGateway.builder()
            .commandBus(commandBus!!)
            .dispatchInterceptors(*dispatchInterceptors.toTypedArray())
            .build()
    }
}
@Modulith(
        systemName = "System",
        sharedModules =["<%= rootPackageName%>.common","<%= rootPackageName%>.domain"],
        useFullyQualifiedModuleNames = true
)
@EnableJpaRepositories
@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = ["<%= rootPackageName%>","org.springframework.modulith.events.jpa",
    "org.axonframework.eventhandling.tokenstore,org.axonframework.eventsourcing.eventstore.jpa"])
class SpringApp {
    companion object {
        fun main(args: Array<String>) {
            runApplication<SpringApp>(*args)
        }

    }
}


fun main(args: Array<String>) {
     runApplication<SpringApp>(*args)
}
