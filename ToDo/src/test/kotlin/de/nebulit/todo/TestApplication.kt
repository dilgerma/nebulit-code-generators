package de.nebulit.todo

import org.springframework.boot.SpringApplication
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName


@TestConfiguration(proxyBeanMethods = false)
internal class MyContainersConfiguration {

    @Bean
    @ServiceConnection
    fun postgresContainer(): PostgreSQLContainer<*> {
        val postgres = PostgreSQLContainer(DockerImageName.parse("postgres")).withReuse(true)
            .withExposedPorts(5432)
        return postgres
    }

}

object TestMyApplication {
    @JvmStatic
    fun main(args: Array<String>) {
        SpringApplication.from(SpringApp::main)
            .with(MyContainersConfiguration::class.java)
            .run(*args)
    }
}
