package <%= _rootPackageName%>.<%=_slice%>.integration

import <%= _rootPackageName%>.common.CommandResult
import <%= _rootPackageName%>.common.support.BaseIntegrationTest
import <%= _rootPackageName%>.common.support.RandomData
import <%= _rootPackageName%>.common.support.awaitUntilAssserted
import <%= _rootPackageName%>.selectedperson.SelectedPersonReadModel
import <%= _rootPackageName%>.selectedperson.SelectedPersonReadModelQuery
<%-_commandImports%>
<%-_queryImports%>
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.queryhandling.QueryGateway
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.assertj.core.api.Assertions.assertThat
import java.util.*

class <%=_name%>Integration : BaseIntegrationTest() {

    @Autowired
    private lateinit var commandGateway: CommandGateway

    @Autowired
    private lateinit var queryGateway: QueryGateway

    @Test
    fun `<%=_name%>`() {

        <%- _given %>

        <%- _then %>

    }

}
