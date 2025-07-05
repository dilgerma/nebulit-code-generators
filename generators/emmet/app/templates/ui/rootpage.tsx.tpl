"use client"
import React, {useState} from 'react';
import Link from "next/link";


export default function Home(props: any) {

    const [isMenuActive, setIsMenuActive] = useState<boolean>(false)

    const toggleMenu = () => {
        setIsMenuActive(!isMenuActive)
    }
    return (

        <div>
            <div>
                <div className="content container">
                    <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
                        <div className="navbar-brand">
                            <a className="navbar-item">
                                <strong>
                                    <%-appName%>
                                </strong>
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
                    <img className="banner" src={"/assets/banner.png"}/>

                    <main>
                    </main>
                </div>
            </div>
    </div>
);
}
