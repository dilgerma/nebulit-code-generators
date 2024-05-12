"use client"
import Head from 'next/head';
import React from 'react';
// @ts-ignore
import {DebugEvents} from '@/app/components/debug/eventsdebug';


export default function Adminview(props: any) {

    return (

        <div>

            <div className="content container">
                <Head>
                    <title>adminview</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main>
                    <DebugEvents/>
                </main>
            </div>
        </div>

    );
}
