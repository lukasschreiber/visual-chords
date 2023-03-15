import { useRef, useState } from "react";
import { getChordDescription } from "../helpers/chords.js";
import "./ChordDescription.css";

export default function Description(props) {
    const ref = useRef();
    const [debouncingTimer, setDebouncingTimer] = useState(null);

    const descriptions = getChordDescription(props.name, props.keynote);
    return (
        <div ref={ref}>
            {descriptions.keywords.map((keyword, index) => {
                const delimiter = index < descriptions.keywords.length - 1 ? ", " : "";
                const description = descriptions.definitions.find(definition => definition.keywords === keyword).definition;

                const handleMouseEnter = (e) => {
                    clearTimeout(debouncingTimer);
                    let target = e.target;
                    while(!target.classList.contains("tooltip_wrapper")){
                        target = target.parentElement
                    }
                    target.querySelector(".tooltip_container").style.display = "block";
                }

                const handleMouseLeave = (e) => {
                    let target = e.target;
                    while(!target.classList.contains("tooltip_wrapper")){
                        target = target.parentElement
                    }

                    setDebouncingTimer(setTimeout(() => {
                        target.querySelector(".tooltip_container").style.display = "none";
                    }, 300))
                }
                
                if(description){
                    return (
                        <span key={keyword} className="tooltip_wrapper" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <u className="tooltip">{keyword}</u>
                            <div className="tooltip_container">{description}</div>
                            {delimiter}
                        </span>
                    );
                }else {
                    return (
                        <span key={keyword}>
                            <span>{keyword}</span>
                            {delimiter}
                        </span>
                    );
                }
            })}
        </div>
    );
}