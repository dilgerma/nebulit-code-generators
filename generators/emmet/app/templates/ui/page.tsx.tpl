"use client"
import React, {useState} from 'react';

<%-_commandImports%>
<%-_readModelImports%>


export default function <%=_pageName%>(props: any) {

    const [view, setView] = useState<string>()


    return (

        <div className="content container">
                <main>
                    <div className="grid">
                        <%- _selections%>
                   </div>

                 {/* main */}
                  <div className={"top-margin"}/>

                   <%- _views%>

                </main>
            </div>

    );
}
