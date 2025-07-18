import {pongoClient} from "@event-driven-io/pongo";
import {postgresUrl} from "@/app/common/db";

export const loadPongoClient = ()=>{
    return pongoClient(postgresUrl);
}