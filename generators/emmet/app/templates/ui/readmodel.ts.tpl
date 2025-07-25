"use client"
// @ts-ignore
import DataTable from '../components/commandselection/DataTable';


export default function <%-_readModelName%>(props: any) {

    return <DataTable aggregateId={props.aggregateId} endpoint={props.endpoint}/>
}




