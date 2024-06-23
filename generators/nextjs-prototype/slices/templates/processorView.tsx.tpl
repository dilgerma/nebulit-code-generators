"use client"
import Head from 'next/head';
import React from 'react';
// @ts-ignore

export default function <%=_pageName%>(props: any) {

    return (

        <div className="content container">

            <div className="content container">
                <Head>
                    <title><%=_name%></title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main>
                    TODO Processor
                </main>
            </div>
        </div>

    );
}
