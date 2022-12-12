import { useEffect, useRef } from "react";
import "./Piano.css";

export default function Piano(props) {
    const ref = useRef();

    const keys = props.tones.map(tone => tone.replaceAll('♯', 's').replaceAll('♭', 'b'));
    useEffect(() => {
        let pianoKeys = ref.current.querySelectorAll("li");

        for (let key of pianoKeys) {
            key.classList.remove("active");
            key.classList.remove("first");
        }

        let currentToneIndex = 0;
        let highlightedKeys = 0;
        for (let i = 0; i < pianoKeys.length; i++) {
            if (pianoKeys[i].classList.contains(keys[currentToneIndex])) {
                pianoKeys[i].classList.add("active");
                if (keys[currentToneIndex] === props.keynote) pianoKeys[i].classList.add("first");
                highlightedKeys++;
                if (highlightedKeys === keys.length) break;
                currentToneIndex++;
            }
        }
    }, [keys]);

    return (
        <ul className="set" ref={ref}>
            <li className="white A Bbb Gx"></li>
            <li className="black As Bb"></li>
            <li className="white B Cb Ax"></li>
            <li className="white C Dbb"></li>
            <li className="black Cs Db"></li>
            <li className="white D Cx Ebb"></li>
            <li className="black Ds Eb"></li>
            <li className="white E Fb Dx"></li>
            <li className="white F Gbb Es"></li>
            <li className="black Fs Gb"></li>
            <li className="white G Abb Fx"></li>
            <li className="black Gs Ab"></li>
            <li className="white A Bbb Gx"></li>
            <li className="black As Bb"></li>
            <li className="white B Cb Ax"></li>
            <li className="white C Dbb"></li>
            <li className="black Cs Db"></li>
            <li className="white D Cx Ebb"></li>
            <li className="black Ds Eb"></li>
            <li className="white E Fb Dx"></li>
            <li className="white F Gbb Es"></li>
            <li className="black Fs Gb"></li>
            <li className="white G Abb Fx"></li>
            <li className="black Gs Ab"></li>
            <li className="white A Bbb Gx"></li>
        </ul>
    );
}