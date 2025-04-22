"use client"
import Head from 'next/head';
import React from 'react';
// @ts-ignore
import {CommandSelection} from '@/app/components/commandselection/CommandSelection';
import {ReadModelSelection} from '@/app/components/commandselection/ReadModelSelection';

<%-_schemaImports%>
<%-_readModelImports%>

export default function <%=_pageName%>(props: any) {

    return (

        <div className="content container">

            <div className="content container">
                <Head>
                    <title><%=_name%></title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main>
                    <div className={"columns"}>
                        {<%-_commandMapping%>?.length > 0 ? <div className={"column"}>
                            <CommandSelection commands={<%-_commandMapping%>}/>
                        </div> : <span/>}
                        {<%-_readModelMapping%>?.length > 0 ? <div className={"column"}>
                            <ReadModelSelection aggregateId={props.aggregateId} readModels={<%-_readModelMapping%>}/>
                        </div> : <span/> }
                    </div>
                </main>
            </div>
        </div>

    );
}
