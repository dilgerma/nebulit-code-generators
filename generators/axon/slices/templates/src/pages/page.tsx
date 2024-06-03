import Head from "next/head";
import {Inter} from "next/font/google";
import styles from "@/styles/Home.module.css";
import {useState} from "react";
import {useEffect} from "react";
import {DebugEvents} from '@/components/common/debug/EventsDebug';
import { useRouter } from "next/router";
import TextInput from '@/components/common/input/TextInput';
import ListSelect from '@/components/common/input/ListSelect';
import {EventStore} from '@/components/common/eventstore/eventstore';
<%- _imports; %>
<%- _handlerImports; %>


const inter = Inter({subsets: ["latin"]});

export default function Home() {
    const [name, setName] = useState("")
    useEffect(() => {
        EventStore.getInstance().initialize(window.localStorage)
    }, []);

    var router = useRouter()
<%- _state; %>


    return (
        <>
            <Head>
                <title></title>
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <div>
                    <DebugEvents></DebugEvents>
<%- _fields; %>
<%- _commandTriggers; %>
                </div>
            </main>
        </>
    );
}
