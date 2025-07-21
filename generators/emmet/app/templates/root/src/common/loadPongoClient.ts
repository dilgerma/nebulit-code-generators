import {pongoClient} from "@event-driven-io/pongo";
import {postgresUrl} from "./db";

export const loadPongoClient = () => {
    return pongoClient(postgresUrl);
}