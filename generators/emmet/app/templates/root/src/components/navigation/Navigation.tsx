import Link from "next/link";
import React, {useState} from "react";

export const Navigation = ()=>{

    const [isMenuActive, setIsMenuActive] = useState<boolean>(false)

    const toggleMenu = () => {
        setIsMenuActive(!isMenuActive)
    }

    return (
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
    )
}