import {useState} from "react";
import {JsonForm} from "@/app/prototype/schema/JsonForm";
import {RJSFValidationError} from "@rjsf/utils";
import ListComponent from "@/app/prototype/components/list/ListComponent";
import SingleComponent from "@/app/prototype/components/single/SingleComponent";


<%- readModelResolvers %>
<%- commmandHandlers %>
<%- commandEnablements %>

<%- commandInitializers %>

export default function <%-name%>() {
    const [modalActive, setModalActive] = useState<boolean>(false)
    const [slice, setSlice] = useState<string>()
    const [command, setCommand] = useState<string>()
    const [activeCommand, setActiveCommand] = useState<string>()

    return <div>
    <div>
            <div>
            <%-commandButtons%>
            </div>
        <div className="big-top-margin">
            <%- template %>
        </div>
        {modalActive ? <div className={'is-active modal'} id="my-modal2">
            <div className="modal-background"></div>
            <div className="modal-content">
                <%-commandModals%>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={() => setModalActive(false)}></button>
        </div> : <span/>}
    </div></div>
}
