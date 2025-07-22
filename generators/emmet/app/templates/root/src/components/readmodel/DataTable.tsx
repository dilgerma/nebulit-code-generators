import React, {useEffect, useState} from 'react';
import {parseQueryEndpoint} from "../util/parseEndpoint";

const DataTable = (props: { endpoint: string, queries: Record<string, string> }) => {
    const [data, setData] = useState<string[]>([]);
    const [headers, setHeaders] = useState<string[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [errorMode, setErrorMode] = useState(false)
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
            if (refresh && Object.keys(props.queries).length > 0) {
                fetchData(parseQueryEndpoint(props.endpoint, {...props.queries})).then((data) => {
                    if (!data) {
                        setErrorMode(true)
                        return
                    }
                    setArraySelection(Array.isArray(data.data))
                    if (Array.isArray(data.data) && !data.data[0])
                        return
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
                }).catch((error) => {
                    setErrorMode(true)
                    setError(error)
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
            {errorMode ?
                <div className={"top-margin notification is-danger"}>Fehler in Laden der Daten<br/>{error}</div> :
                <span/>}
            {arraySelection ? <select onChange={handleSelectionChange}>
                {data.map((_, index) => (
                    <option key={index} value={index}>{`Item ${index + 1}`}</option>
                ))}
            </select> : <span/>}
            {props.queries && Object.keys(props.queries)?.length > 0 ? <button onClick={() => setRefresh(true)} className={"button is-small left-margin"}><i
                className="fa-solid fa-arrows-rotate"></i></button> : <span/>}

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
                            <td>{`${data[selectedIndex][header]?.toString()}`}</td>
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

export default DataTable;
