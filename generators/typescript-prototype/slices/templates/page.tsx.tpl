"use client"
import Head from 'next/head';
import React from 'react';
// @ts-ignore
import {DebugEvents} from '@/app/components/debug/eventsdebug';
import {CommandSelection} from '@/app/components/commandselection/CommandSelection';
<%-_commandHandlerImports%>
<%-_schemaImports%>

export default function <%=_pageName%>(props: any) {

    return (

        <div className="content container">

            <div className="content container">
                <Head>
                    <title><%=_name%></title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main>
                    <CommandSelection commands={<%-_handlerMapping%>}/>
                </main>
            </div>
        </div>

    );
}
