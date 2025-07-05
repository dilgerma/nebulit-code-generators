"use client"
import React, {useState} from 'react';
import Link from "next/link";

<%-_commandImports%>
<%-_readModelImports%>


export default function <%=_pageName%>(props: any) {

    const [view, setView] = useState<string>()
     const [isMenuActive, setIsMenuActive] = useState<boolean>(false)

        const toggleMenu = () => {
            setIsMenuActive(!isMenuActive)
        }

                    return (

            <div className="content container">
                <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <a className="navbar-item" onClick={() => setView(undefined)}>
                            <strong><%-appName%></strong>
                        </a>

                        <a
                            role="button"
                            className={`navbar-burger ${isMenuActive ? 'is-active' : ''}`}
                            aria-label="menu"
                            aria-expanded="false"
                            onClick={toggleMenu}
                        >
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>

                    <div className={`navbar-menu ${isMenuActive ? 'is-active' : ''}`}>
                        <div className="navbar-start">
                            <%- navbar_items %>
                        </div>
                    </div>
                </nav>
                <img className="banner" src={"/assets/banner.jpg"}/>

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
