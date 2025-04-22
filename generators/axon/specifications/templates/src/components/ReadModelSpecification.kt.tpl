package <%= _packageName%>.<%=_slice%>.integration

import <%= _rootPackageName%>.common.support.BaseIntegrationTest
import <%= _rootPackageName%>.common.support.RandomData
import <%= _rootPackageName%>.common.support.awaitUntilAssserted
<%-_commandImports%>
<%-_queryImports%>
import org.axonframework.commandhandling.gateway.CommandGateway
import org.axonframework.queryhandling.QueryGateway
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.assertj.core.api.Assertions.assertThat
import java.util.*

/**
<%=_comment%>

Boardlink: <%- link%>
*/
class <%=_name%> : BaseIntegrationTest() {

    @Autowired
    private lateinit var commandGateway: CommandGateway

    @Autowired
    private lateinit var queryGateway: QueryGateway

    @Test
    fun `<%=_testname%>`() {

        <%- _given %>

        <%- _then %>

    }

}
