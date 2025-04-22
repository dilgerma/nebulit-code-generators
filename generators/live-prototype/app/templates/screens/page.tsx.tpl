'use client'

import React, {useState} from "react";
<%- screenImports %>
import {DebugEvents} from "@/app/prototype/debug/eventsdebug";

export default function PrototypePage() {

    const [activeFlow, setActiveFlow] = useState<string>()

    return <section className="section main-container">
        <div className="">
            <div className="columns">

                <div className="column is-2">
                    <aside className="menu">
                      <p className={"menu-label"}>
                                        <img width={100} src="<%- logo%>"/>
                                    </p>
                        <p className="menu-label">
                            General
                        </p>
                        <ul className="menu-list">
                            <%- flows %>
                        </ul>

                    </aside>


                </div>
                <div className="column">
                    <%- viewList %>
                </div>
            </div>
        </div>
            <DebugEvents/>

    </section>
}