 it('<%-scenario_title%>', async () => {
        <%- givenFields %>
        await given(<%-given%>)
            .when([])
            .then(
                expectPongoDocuments
                    .fromCollection<<%-readModel%>ReadModel>(
                        "<%-readModel%>-collection",
                    )
                    .withId("<%-stream%>")
                    .toBeEqual(<%-expectedProjectionValues%>),
            );
    });