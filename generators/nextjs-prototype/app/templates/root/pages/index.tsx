"use client"
import Head from 'next/head';
import React, { useState } from 'react';

// @ts-ignore
import {DebugEvents} from '@/app/components/debug/eventsdebug';
import SliceViews from '@/app/components/SliceViews';
import {ViewSelection} from '@/app/core/types';
<%-_imports%>


export default function Home(props: any) {

    const [aggregateId, setAggregateId] = useState<string>()

    /*
    * JSON View Definitions per Slice.
    * */
    var sliceViews:ViewSelection[] = [<%-_views%>]
    return (

        <div>
            <div className="content container">
                               <img className="banner" src={"/assets/banner.png"}/>
                <Head>
                    <title>Prototype</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>

                <main>
                    <DebugEvents applyAggregateIdFn={setAggregateId}/>
                    <SliceViews aggregateId={aggregateId} views={sliceViews}/>
                </main>
            </div>
        </div>

    );
}
