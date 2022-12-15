import { useEffect, useRef } from "react";
import { getAlternativeNoteNames } from "../helpers/chords.js";
import { formatNote, Formats } from "../helpers/formatters.js";
import "./Piano.css";

export default function Piano(props) {
    const ownRef = useRef();
    const ref = props.reference || ownRef;
    const from = props.from || "G3";
    const to = props.to || "A5";

    const octave = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let octaves = to.match(/[0-9]\b/g)[0] - from.match(/[0-9]\b/g)[0] + 1;
    let fromOctave = Number.parseInt(from.match(/[0-9]\b/g)[0]);
    let toneRange = [from.match(/[A-H]#?/g)[0], to.match(/[A-H]#?/g)[0]];
    const keys = [];
    let fromIndex = octave.indexOf(toneRange[0]);
    let toIndex = octave.indexOf(toneRange[1]);

    for (let i = 0; i < octaves; i++) {
        for (let j = (i === 0 ? fromIndex : 0); j < (i === octaves - 1 ? toIndex + 1 : octave.length); j++) {
            keys.push({
                key: octave[j],
                names: getAlternativeNoteNames(octave[j]).map(name => formatNote(name, Formats.NORMALIZED)),
                white: !octave[j].match(/#/g),
                octave: fromOctave + i
            });
        }
    }

    useEffect(() => {
        let pianoKeys = ref.current.querySelectorAll("li");
        const keysToHighlight = props.tones ? props.tones.map(tone => {
            return {
                key: formatNote(tone, Formats.NORMALIZED_NO_OCTAVE),
                octave: tone.match(/[0-9]\b/g) ? Number.parseInt(tone.match(/[0-9]\b/g)[0]) : null
            };
        }) : [];

        for (let key of pianoKeys) {
            key.classList.remove("active");
            key.classList.remove("first");
            if (props.names === "highlighted") key.innerHTML = "";
        }

        let currentToneIndex = 0;
        let highlightedKeys = 0;
        // highlight all keys without octave
        for (let i = 0; i < pianoKeys.length; i++) {
            while (currentToneIndex < keysToHighlight.length && keysToHighlight[currentToneIndex].octave !== null) currentToneIndex++;
            if (currentToneIndex === keysToHighlight.length || keysToHighlight[currentToneIndex].octave !== null) break;
            if (pianoKeys[i].classList.contains(keysToHighlight[currentToneIndex].key)) {
                pianoKeys[i].classList.add("active");
                if (props.names === "highlighted") pianoKeys[i].innerHTML = formatNote(keysToHighlight[currentToneIndex].key, Formats.MUSICAL);
                // keynote may make problems if it has an octave attached
                if (props.keynote && keysToHighlight[currentToneIndex].key === formatNote(props.keynote, Formats.NORMALIZED_NO_OCTAVE)) pianoKeys[i].classList.add("first");
                highlightedKeys++;
                if (highlightedKeys === keysToHighlight.filter(key => key.octave === null).length) break;
                currentToneIndex++;
            }
        }

        // highlight all keys with octave
        for (let key of keysToHighlight.filter(key => key.octave !== null)) {
            let pianoKey = Array.from(pianoKeys).find(pk => pk.classList.contains("O" + key.octave) && pk.classList.contains(key.key));
            pianoKey.classList.add("active");
            if (props.names === "highlighted") pianoKey.innerHTML = formatNote(key.key, Formats.MUSICAL);
        }
    }, [props.tones, props.keynote, ref]);

    return (
        <ul className="set" ref={ref} style={{ width: `calc(${keys.filter(key => key.white).reduce((acc, v) => acc += 2, 0)}em + ${keys.filter(key => key.white).reduce((acc, v) => acc += 2.5, 0)}px)` }}>
            {keys.map(key => <li className={`${key.white ? "white" : "black"} ${key.names.join(" ")} O${key.octave}`}>{props.names === "all" ? formatNote(key.key, Formats.MUSICAL) : ""}</li>)}
        </ul>
    );
}