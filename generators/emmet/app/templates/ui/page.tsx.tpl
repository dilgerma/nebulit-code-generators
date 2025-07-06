import <%=_pageName%>Component from './<%=_pageName%>Component';
import {requireUser} from "@/app/supabase/requireUser";

export default async function <%=_pageName%>(props: any) {
        let principal = await requireUser()
        return <<%=_pageName%>Component/>
}
