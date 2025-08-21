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
    const [currentImage, setCurrentImage] = useState<number>(0)
    const [images, setImages] = useState<string[]>([<%-images%>])
    const [descriptions, setDescriptions] = useState<string[]>([<%-descriptions%>])

    <%- commandInvokers %>

    const nextImage = ()=>{
        if(currentImage < images.length - 1){
            setCurrentImage(currentImage + 1)
        } else {
            setCurrentImage(0)
        }
    }

    return <div>
    <div>

            <div>
            <%-commandButtons%>
            </div>
            <div className="">
            {images[currentImage] ? <div><img width="50%" onClick={()=>nextImage()} src={`screens/${images[currentImage]}.png`} /></div> : <span/>}
            {images[currentImage] && descriptions[currentImage] ? <div className="has-text-centered"><small>{descriptions[currentImage]}</small></div> : <span/>}
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
