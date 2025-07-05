"use client"
import Head from 'next/head';
import React, { useState } from 'react';

// @ts-ignore
import SliceViews from '@/app/components/SliceViews';
import {ViewSelection} from '@/app/core/types';


export default function Home(props: any) {

    const [aggregateId, setAggregateId] = useState<string>()

    /*
    * JSON View Definitions per Slice.
    * */
    return (

        <div>
            <div className="content container">
                               <img className="banner" src={"/assets/banner.jpg"}/>
                <Head>
                    <title>Prototype</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>

                <main>
                </main>
            </div>
        </div>

    );
}
