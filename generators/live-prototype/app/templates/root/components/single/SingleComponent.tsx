
const renderObject = (object)=>{
    return typeof object == "object" ? JSON.stringify(object, null, 2) : object;
}

export default function SingleComponent(props: any) {

    let renderItem = (item)=>{
        return props?.renderFunction ? props.renderFunction(item) : item=>item
    }

    return <div className={"single-value"}>
        {props.readModel?.result && ((Object.values(props.readModel?.result).some(value => value))) ?<div className={"box"}><h3>{props.label}</h3>
           <table>
               { typeof renderItem(props.readModel?.result) == "object" ? Object.keys(renderItem(props.readModel?.result)).map(key =>
                   <tr>
                       <td>{renderObject(key)}</td>
                       <td>{renderObject(props.readModel?.result[key])}</td>
                   </tr>) : <tr><td>{renderObject(renderItem(props.readModel?.result))}</td></tr>}
           </table>
        </div> : <span/>}
    </div>
}