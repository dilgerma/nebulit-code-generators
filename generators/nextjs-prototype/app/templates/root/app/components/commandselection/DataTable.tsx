import React, {useEffect, useState} from 'react';
import {parseEndpoint} from '@/app/components/util/parseEndpoint';

const DataTable = (props: any) => {
    const [data, setData] = useState<string[]>([]);
    const [headers, setHeaders] = useState<string[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0);



    useEffect(() => {
        fetchData(parseEndpoint(props.endpoint, {aggregateId: props.aggregateId})).then((data) => {
            if(!data)
                return
            if(Array.isArray(data.data) && !data.data[0])
                return
            if(Array.isArray(data.data)) {
                setData(data.data)
                setHeaders(Object.keys(data.data[0]))
            } else {
                setData([data])
                setHeaders(Object.keys(data))
            }

        })
    }, [props.endpoint]);

    const handleSelectionChange = (event:any) => {
      setSelectedIndex(event.target.value)
    };

    // @ts-ignore
    return (
        <div>
              <select onChange={handleSelectionChange}>
                {data.map((_, index) => (
                  <option key={index} value={index}>{`Item ${index + 1}`}</option>
                ))}
              </select>
              {data[selectedIndex] && (
                props.children ?
                    React.cloneElement(props.children, { data, headers, selectedIndex }) :
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
                        <td>{data[selectedIndex][header]}</td>
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json(); // This will be a list of objects
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export default DataTable;
