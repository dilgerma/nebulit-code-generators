it('<%-scenario_title%>', () => {

            const command: <%-command%>Command = {
                type: '<%-command%>',
                data: {
                    <%-commandFields%>
                },
                metadata: {now: new Date()},
            }

            given(<%-given%>)
                .when(command)
                <%-then%>
        });