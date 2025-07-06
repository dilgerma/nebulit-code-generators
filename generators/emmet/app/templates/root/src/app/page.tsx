"use client"
import React from 'react';
import {Navigation} from "@/app/components/navigation/Navigation";


export default function Home(props: any) {

    return (

        <div>
            <div>
                <div className="content container">
                    <Navigation/>

                    <img className="banner" src={"/assets/banner.png"}/>

                    <main>
                    </main>
                </div>
            </div>
    </div>
);
}
