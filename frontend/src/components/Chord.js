import Notation from "./Notation";
import Piano from "./Piano";
import PlayChord from "./PlayChord";
import Select from "react-select";
import moment from "moment";

import "./Chord.css";
import { useEffect, useRef, useState } from "react";

export default function Chord(props) {
    const [inversion, setInversion] = useState(props.chord.selectedInversion);

    const handleInversionChange = (e) => {
        setInversion(e.value);
    };

    const options = [{ value: 0, label: "Nicht invertiert", selected: true }, ...props.chord.inversions.map(i => {
        return { value: i.inversion, label: `${i.inversion}te Invertierung` };
    })];

    useEffect(() => {
        setInversion(props.chord.selectedInversion);
    }, [props.chord]);

    const notes = inversion !== 0 ? props.chord.inversions.find(i => i.inversion === inversion).notes : props.chord.notes;
    return (
        <div className="chord">
            <div className="header">
                <Select
                    options={options}
                    value={
                        options.filter(option =>
                            option.value === inversion)
                    }
                    onChange={handleInversionChange}
                />
                <h1>{props.chord.name}<span className="alt">{props.chord.alternate.length > 0 ? ", " : ""} {props.chord.alternate.join(", ")}</span></h1>
            </div>
            <h3>{inversion === 0 ? "Nicht invertiert" : `${inversion}te Invertierung`}</h3>
            <h3 style={{ marginBottom: "30px" }}>{notes.join(", ").replaceAll("♭♭", "𝄫")}</h3>
            <div className="notations">
                <Notation tones={notes} />
                <Notation tones={notes} octave={notes.length > 5 ? 2 : 3} />
            </div>
            <AudioWrapper notes={notes} chord={props.chord}/>
        </div>
    );
}


const AudioWrapper = (props) => {
    const pianoRef = useRef();

    return (
        <div>
            <Piano tones={props.notes} keynote={props.chord.notes[0]} reference={pianoRef} />
            <div className="audio">
                <PlayChord tones={props.notes} piano={pianoRef} sequence instrument="acoustic_grand_piano" icon="piano" />
                <PlayChord tones={props.notes} instrument="marimba" icon="xylophone" />
                <PlayChord tones={props.notes} piano={pianoRef} sequence nochord octave={2} instrument="tuba" icon="tuba" />
                <PlayChord tones={props.notes} sequence instrument="acoustic_guitar_nylon" icon="guitar" />
                <PlayChord tones={props.notes} sequence instrument="banjo" icon="banjo" />
                <PlayChord tones={props.notes} sequence instrument="accordion" icon="accordion" />
                <PlayChord tones={props.notes} sequence nochord octave={4} instrument="clarinet" icon="clarinet" />
                <PlayChord tones={props.notes} sequence instrument="sitar" icon="sitar" />
                <PlayChord tones={props.notes} sequence nochord octave={2} instrument="bassoon" icon="bassoon" />
                <PlayChord tones={props.notes} sequence nochord octave={3} instrument="cello" icon="cello" />
                <PlayChord tones={props.notes} sequence instrument="electric_guitar_jazz" icon="electric_guitar" />
                <PlayChord tones={props.notes} sequence instrument="french_horn" icon="french_horn" />
                <PlayChord tones={props.notes} sequence nochord octave={3} instrument="trombone" icon="trombone" />
                <PlayChord tones={props.notes} sequence nochord octave={4} instrument="trumpet" icon="trumpet" />
                <PlayChord tones={props.notes} sequence instrument="harmonica" icon="harmonica" />
                <PlayChord tones={props.notes} sequence instrument="orchestral_harp" icon="harp" />
                <PlayChord tones={props.notes} sequence nochord instrument="pan_flute" icon="pan_flute" />
                <PlayChord tones={props.notes} sequence nochord instrument="alto_sax" icon="saxophone" />
                <PlayChord tones={props.notes} piano={pianoRef} sequence instrument="church_organ" icon="keyboard" />
            </div>
        </div>
    );
};