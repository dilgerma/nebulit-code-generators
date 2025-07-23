import cron from "node-cron";
import {parseQueryEndpoint} from "../components/util/parseEndpoint";

export type ProcessorTodoItem = {
    id: string,
    status: string
    createdAt: Date
}

export type ProcessorConfig = {
    schedule:string,
    endpoint:string,
    query?: Record<string, string>
}

export const startProcessor = <T>(config:ProcessorConfig, handler: (item:T&ProcessorTodoItem)=>void) =>{
    cron.schedule(config.schedule,async () => {
        const data = await fetchData(parseQueryEndpoint(config.endpoint, config.query ? config.query : {"status": "OPEN"}))
        if (data?.length > 0) {
            handler(data[0]);
        } else {
            //console.log("No item to process")
        }
    })
}


async function fetchData(endpoint: string) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return Promise.reject(`HTTP error! status: ${response.status}`);
        }

        return await response.json(); // This will be a list of objects
    } catch (error) {
        console.error('Error fetching data:', error);
        return Promise.reject(`Error fetching data ${error}`);
    }
}




