import {GetServerSidePropsContext} from "next";
import {createClient} from "./serverProps";

export async function commonGetServerSideProps(context: GetServerSidePropsContext) {
    const supabase = createClient(context)
    const { data, error } = await supabase.auth.getUser()
    if (error || !data) {
        return {
            redirect: {
                destination: '/auth/login',
                permanent: false,
            },
        }
    }
    return {
        props: {
            user: data.user,
        },
    }
}