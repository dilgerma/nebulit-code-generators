"use client"
import React, {useState} from 'react';
import Link from "next/link";
import {Navigation} from "@/app/components/navigation/Navigation";


<%-_commandImports%>
<%-_readModelImports%>


export default function <%=_pageName%>Component(props: any) {

    const [view, setView] = useState<string>()

                    return (

            <div className="content container">
                <Navigation/>
                <img className="banner" src={"/assets/banner.png"}/>

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
