import React, {useState} from "react";

<%- screenImports %>

export default function <%=name%>() {

    const [activeView, setActiveView] = useState<string>()

    return <div className="column">
        <div className="tabs is-boxed">
            <ul>
            <%- viewList %>
            </ul>
        </div>

        <div className="content">
        <%- viewDisplay %>
        </div>
    </div>
}

