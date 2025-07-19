import <%=_pageName%>Component from '../screens/<%=_lowercasePageName%>/<%=_pageName%>Component';
import {Navigation} from "../components/navigation/Navigation";
import {commonGetServerSideProps} from "../supabase/ProtectedPageProps";
import {GetServerSidePropsContext} from "next";


export default function <%=_pageName%>(props: any) {
        return <<%=_pageName%>Component/>
}

export const getServerSideProps = async (context: GetServerSidePropsContext):Promise<any> => {
    return commonGetServerSideProps(context)}