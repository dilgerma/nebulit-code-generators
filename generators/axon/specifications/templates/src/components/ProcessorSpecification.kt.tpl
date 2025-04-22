package <%= _packageName%>.<%=_slice%>.integration

import <%= _rootPackageName%>.common.support.BaseIntegrationTest
import <%= _rootPackageName%>.common.support.RandomData
import <%= _rootPackageName%>.common.support.awaitUntilAssserted
<%-_commandImports%>
<%= _elementImports%>
import org.axonframework.commandhandling.gateway.CommandGateway
import org.junit.jupiter.api.Test
import <%= _rootPackageName%>.common.support.StreamAssertions
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
    private lateinit var streamAssertions: StreamAssertions

    @Test
    fun `<%=_testname%>`() {

        <%- _given %>

        <%- _then %>

    }

}
