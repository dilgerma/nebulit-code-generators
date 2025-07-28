 it('<%-scenario_title%>', async () => {
        <%- givenFields %>
        await given(<%-given%>)
            .when([])
            .then(
                expectPongoDocuments
                    .fromCollection<<%-readModel%>ReadModel>(
                        "<%-collection%>-collection",
                    )
                    .withId("<%-stream%>")
                    .toBeEqual(<%-expectedProjectionValues%>),
            );
    });