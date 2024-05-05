"use client"
import Head from 'next/head';
import React from 'react';
// @ts-ignore
import {DebugEvents} from '@/app/components/debug/eventsdebug';
import SliceViews from '@/app/components/SliceViews';
import {ViewSelection} from '@/app/core/types';
<%-_imports%>


export default function Home(props: any) {

    /*
    * JSON View Definitions per Slice.
    * */
    var sliceViews:ViewSelection[] = [<%-_views%>]
    return (

        <div>

            <div className="content container">
                <Head>
                    <title>Prototype</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main>
                    <DebugEvents/>
                    <SliceViews views={sliceViews}/>
                </main>
            </div>
        </div>

    );
}
