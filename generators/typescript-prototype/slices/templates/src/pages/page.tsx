"use client"
import Head from 'next/head';
import React from 'react';
// @ts-ignore
import {DebugEvents} from '@/app/components/debug/eventsdebug';


export default function <%=_pageName%>(props: any) {

    return (

        <div>

            <div className="content container">
                <Head>
                    <title><%=_name%></title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main>
                    <DebugEvents/>
                </main>
            </div>
        </div>

    );
}
