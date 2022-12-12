import Notation from "./Notation";
import Piano from "./Piano";
import PlayChord from "./PlayChord";
import Select from "react-select";

import "./Chord.css";
import { useState } from "react";

export default function Chord(props) {
    const [inversion, setInversion] = useState(props.chord.selectedInversion);

    const handleInversionChange = (e) => {
        setInversion(e.value);
    };

    const options = [{ value: 0, label: "Nicht invertiert", selected: true }, ...props.chord.inversions.map(i => {
        return { value: i.inversion, label: `${i.inversion}te Invertierung` };
    })];

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
            <h3 style={{ marginBottom: "30px" }}>{notes.join(", ")}</h3>
            <div className="notations">
                <Notation tones={notes} treble />
                <Notation tones={notes} bass />
            </div>
            <Piano tones={notes} keynote={props.chord.notes[0]} />
            <div className="audio">
                <PlayChord tones={notes} treble sequence instrument="acoustic_grand_piano" icon="piano" />
                <PlayChord tones={notes} treble instrument="marimba" icon="xylophone" />
                <PlayChord tones={notes} bass sequence nochord octaveShift={-1} instrument="tuba" icon="tuba" />
                <PlayChord tones={notes} sequence instrument="acoustic_guitar_nylon" icon="guitar" />
                <PlayChord tones={notes} sequence instrument="banjo" icon="banjo" />
                <PlayChord tones={notes} sequence instrument="accordion" icon="accordion" />
                <PlayChord tones={notes} sequence nochord octaveShift={1} instrument="clarinet" icon="clarinet" />
                <PlayChord tones={notes} sequence instrument="sitar" icon="sitar" />
                <PlayChord tones={notes} sequence nochord bass octaveShift={-1} instrument="bassoon" icon="bassoon" />
                <PlayChord tones={notes} sequence nochord instrument="cello" icon="cello" />
                <PlayChord tones={notes} sequence instrument="electric_guitar_jazz" icon="electric_guitar" />
                <PlayChord tones={notes} sequence instrument="french_horn" icon="french_horn" />
                <PlayChord tones={notes} sequence nochord bass octaveShift={-1} instrument="trombone" icon="trombone" />
                <PlayChord tones={notes} sequence nochord octaveShift={1} instrument="trumpet" icon="trumpet" />
                <PlayChord tones={notes} sequence instrument="harmonica" icon="harmonica" />
                <PlayChord tones={notes} sequence instrument="orchestral_harp" icon="harp" />
                <PlayChord tones={notes} sequence instrument="pan_flute" icon="pan_flute" />
                <PlayChord tones={notes} sequence nochord instrument="alto_sax" icon="saxophone" />
                <PlayChord tones={notes} treble sequence instrument="church_organ" icon="keyboard" />
            </div>
        </div>
    );
}