package <%= rootPackageName%>.common.support

import org.junit.jupiter.api.Test
import org.springframework.test.context.TestPropertySource

@TestPropertySource(properties = [
    "spring.jpa.generate-ddl=true",
    "spring.jpa.show-sql=true",
])class DbLogTest: BaseIntegrationTest() {

    @Test
    fun logSqlStatements(){
        //no-op - just logs sql
    }
}
