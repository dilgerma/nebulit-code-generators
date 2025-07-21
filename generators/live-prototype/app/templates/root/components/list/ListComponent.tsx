import {useEffect, useState} from "react";

const renderObject = (object) => {
    return typeof object == "object" ? JSON.stringify(object, null, 2) : object;
}

export default function ListComponent(props: {
    readModel: any,
    label: string,
    renderFunction?: (() => { key: string, fields: string[] })
}) {

    const [item, setItem] = useState<any>(-1)
    const [key, setKey] = useState<string>()
    const [fieldFilter, setFieldFilter] = useState<string[]>()


    useEffect(() => {
        if (props.renderFunction) {
            let result = props.renderFunction();
            setKey(result.key)
            setFieldFilter(result.fields)
        }
    }, [item]);

    return <div className={"list-value"}>
        {props.readModel?.resultList && props.readModel?.resultList?.some(item => typeof item != "object" || Object.values(item).some(value => !!value)) ?
            <div><h3>{props.label}</h3>
                <div className={"box"}>
                    <div className={""}>
                        <div className={""}>
                            <div className="select">
                                <select value={item} onChange={(evt) => setItem(evt.target.value)}>
                                    <option value={-1}>Select</option>
                                    {props.readModel?.resultList?.map((item: any, index: number) => (
                                        <option key={index} value={index}>{
                                            key ?
                                                props.readModel?.resultList[index][key] ?? index : index}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {item !== -1 && props.readModel?.resultList.length > 0 ? <div className={""}>
                            <div className="table">
                                <tbody>
                                {fieldFilter ?
                                    // field values are set, only show them
                                    fieldFilter.map(value => <tr>
                                            <td>{value}</td>
                                            <td>{renderObject(props.readModel?.resultList[item][value])}</td>
                                        </tr>
                                    )
                                    : (
                                        props.readModel ? Object.keys(props.readModel?.resultList[item]).map((key) => (
                                            <tr>
                                                <td>{key}</td>
                                                <td>{renderObject(props.readModel?.resultList[item][key])}</td>
                                            </tr>
                                        )) : <span/>
                                    )}
                                </tbody>
                            </div>
                        </div> : <span/>}
                    </div>
                </div>
            </div> : <span/>}
    </div>
}