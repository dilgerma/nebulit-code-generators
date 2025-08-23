import React, {useEffect, useState} from 'react';
import {parseQueryEndpoint} from "../util/parseEndpoint";

const DataTable = (props: { endpoint: string, queries: Record<string,string> }) => {
    const [data, setData] = useState<string[]>([]);
    const [headers, setHeaders] = useState<string[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [errorMode, setErrorMode] = useState(false)
    const [noData, setNoData] = useState(false)
    const [error, setError] = useState("")
    const [refresh, setRefresh] = useState(false)
    const [arraySelection, setArraySelection] = useState(false)

    useEffect(() => {
        if (!data) {
            return
        }
        if (Array.isArray(data)) {
            setHeaders(Object.keys(data[selectedIndex] ?? {}));
        } else {
            setHeaders(Object.keys(data ?? {}));
        }
    }, [selectedIndex]);


    useEffect(() => {
        try {
            if (refresh) {
                fetchData(parseQueryEndpoint(props.endpoint, props.queries)).then((data) => {
                    if (!data) {
                        setNoData(true)
                        return
                    }
                    setArraySelection(Array.isArray(data.data) || Array.isArray(data))
                    if(Array.isArray(data) && !data[0]) {
                        setNoData(true)
                        return
                    }
                    if (Array.isArray(data.data) && !data.data[0]) {
                        setNoData(true)
                        return
                    }
                    if (Array.isArray(data)) {
                        setData(data)
                        setHeaders(Object.keys(data[0]))
                        if (data.length > 1) {
                            setSelectedIndex(0)
                        }
                        return
                    }
                    if (Array.isArray(data.data)) {
                        setData(data.data)
                        setHeaders(Object.keys(data.data[0]))
                        if (data.data.length > 1) {
                            setSelectedIndex(0)
                        }
                    } else {
                        setSelectedIndex(0)
                        setData([data.data])
                        setHeaders(Object.keys(data.data))
                    }

                    setRefresh(false)
                    setErrorMode(false)
                    setNoData(false)
                }).catch((error) => {
                    setErrorMode(true)
                    setError(error)
                    setNoData(false)
                    setData([])
                })
            }
        } finally {
            setRefresh(false)
        }
    }, [props.endpoint, refresh]);

    const handleSelectionChange = (event: any) => {
        setSelectedIndex(event.target.value)
    };

    // @ts-ignore
    return (
        <div>
            {noData ?
                <div className={"top-margin notification is-info"}>No Data found<br/>{error}</div> :
                <span/>}
            {errorMode ?
                <div className={"top-margin notification is-danger"}>Error loading Data<br/>{error}</div> :
                <span/>}
            {arraySelection ? <select onChange={handleSelectionChange}>
                {data.map((_, index) => (
                    <option key={index} value={index}>{`Item ${index + 1}`}</option>
                ))}
            </select> : <span/>}
            <button onClick={() => setRefresh(true)} className={"button is-small left-margin"}><i
                className="fa-solid fa-arrows-rotate"></i></button>

            {data[selectedIndex] && (
                <table>
                    <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {headers.map((header) => (
                        <tr key={header}>
                            <td>{header}</td>
                            {/*@ts-ignore*/}
                            <td>{`${renderAttribute(data[selectedIndex][header])}`}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

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


function renderAttribute(attr: unknown): string {
    if (attr === null || attr === undefined) {
        return '';
    }

    // Check for primitive types (string, number, boolean, bigint, symbol)
    if (typeof attr === 'string' || typeof attr === 'number' || typeof attr === 'boolean' || typeof attr === 'bigint' || typeof attr === 'symbol') {
        return attr.toString();
    }

    // For all other types (objects, arrays, functions), render as JSON
    try {
        return JSON.stringify(attr);
    } catch {
        return '[Unserializable]';
    }
}

export default DataTable;
