import { useEffect, useRef } from "react";
import { getAlternativeNoteNames } from "../helpers/chords.js";
import { formatNote, Formats } from "../helpers/formatters.js";
import "./Piano.css";

export default function Piano(props) {
    const ownRef = useRef();
    const animationReference = useRef();
    const previousTimeReference = useRef();
    const previousKeys = useRef();

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

    let absoluteAnimationTime = 0;

    const animate = (time) => {
        if (previousTimeReference.current !== undefined) {
            const delta = time - previousTimeReference.current;

            if (props.tones.length > 0) {
                if(absoluteAnimationTime === 0) absoluteAnimationTime = 1000 * Math.min(...props.tones.map(channel => channel.notes.length > 0 ? channel.notes[0].time : Number.MAX_VALUE))
                if(absoluteAnimationTime === Number.MAX_VALUE) absoluteAnimationTime = 0; // don't want to think about a better solution right now (:
                absoluteAnimationTime += delta;
                const startTime = absoluteAnimationTime;

                const keysToHighlightPerChannel = [];
                for (let channel of props.tones) {
                    const keysToHighlight = channel.notes.filter(note => !note.time || ((note.time <= (startTime - 100) / 1000) && ((startTime - delta) / 1000 <= note.duration + note.time)));
                    keysToHighlightPerChannel.push({channel: channel.channel, notes: keysToHighlight});
                }

                highlightKeys(keysToHighlightPerChannel, props.keynote)
            }
        }

        previousTimeReference.current = time;
        animationReference.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        animationReference.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationReference.current);
    }, [props.tones]);

    const highlightKeys = (keysToHighlight, keynote = null) => {
        let pianoKeys = ref.current?.querySelectorAll("li");

        const colors = ["#5fd800", "pink", "blue", "red"]

        keysToHighlight = keysToHighlight.flatMap(track => track.notes.map(note => {
            return { ...note, channel: track.channel };
        })).map(tone => {
            return {
                key: formatNote(tone.note, Formats.NORMALIZED_NO_OCTAVE),
                color: colors[tone.channel],
                octave: tone.note.match(/[0-9]\b/g) ? Number.parseInt(tone.note.match(/[0-9]\b/g)[0]) : null
            };
        });

        // do not change anything if there are no changes to make
        if(JSON.stringify(keysToHighlight) === JSON.stringify(previousKeys.current)) return;

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
                if (keynote && keysToHighlight[currentToneIndex].key === formatNote(keynote, Formats.NORMALIZED_NO_OCTAVE)) pianoKeys[i].classList.add("first");
                highlightedKeys++;
                if (highlightedKeys === keysToHighlight.filter(key => key.octave === null).length) break;
                currentToneIndex++;
            }
        }

        // highlight all keys with octave
        for (let key of keysToHighlight.filter(key => key.octave !== null)) {
            let pianoKey = Array.from(pianoKeys).find(pk => pk.classList.contains("O" + key.octave) && pk.classList.contains(key.key));
            pianoKey?.classList.add("active");
            pianoKey?.style.setProperty("--color", key.color);
            if (props.names === "highlighted" && pianoKey) pianoKey.innerHTML = formatNote(key.key, Formats.MUSICAL);
        }

        previousKeys.current = keysToHighlight;
    }

    return (
        <div className="piano">
            <ul className="set" ref={ref} style={{ width: `calc(${keys.filter(key => key.white).reduce((acc, v) => acc += 2, 0)}em + ${keys.filter(key => key.white).reduce((acc, v) => acc += 2.5, 0)}px)` }}>
                {keys.map(key => <li key={key.names[0]+key.octave} className={`${key.white ? "white" : "black"} ${key.names.join(" ")} O${key.octave}`}>{props.names === "all" ? formatNote(key.key, Formats.MUSICAL) : ""}</li>)}
            </ul>
        </div>
    );
}