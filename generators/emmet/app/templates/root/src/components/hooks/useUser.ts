import {useEffect, useState} from "react";

export type User = {
    userId:string,
    email:string
}

export function useUser() {
    const [user, setUser] = useState<User>()

    useEffect(() => {
        (async ()=>{
            const user = await fetch("/api/user").then((res)=>res.json())
            setUser({userId: user.userId, email: user.email})
        })()

    }, []);

    return { user }
}