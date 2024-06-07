import <%= _rootPackageName%>.common.Event
import <%= _rootPackageName%>.common.support.RandomData
import <%= _rootPackageName%>.domain.<%=_aggregate%>
import de.nebulit.common.CommandException
import org.axonframework.test.aggregate.AggregateTestFixture;
import org.axonframework.test.aggregate.FixtureConfiguration;
import org.junit.jupiter.api.BeforeEach
import org.hamcrest.Matcher
import org.hamcrest.Matchers
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions
<%= _elementImports%>
<%= _typeImports%>

class <%=_name%> {

    private lateinit var fixture: FixtureConfiguration<<%=_aggregate%>>

    @BeforeEach
    fun setUp() {
        fixture = AggregateTestFixture(<%=_aggregate%>::class.java)
    }

    @Test
    fun `<%=_name%>`() {
      //GIVEN
      val events = mutableListOf<Event>()
      <%- _given%>

      //WHEN
      <%- _when %>

      //THEN
      val expectedEvents = mutableListOf<Event>()
      <%- _thenExpectations %>

      fixture.given(events)
        .`when`(command)
        <%- _then %>
    }

}
