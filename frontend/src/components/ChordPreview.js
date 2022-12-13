import Notation from "./Notation";
import handleViewport from 'react-in-viewport';
import "./ChordPreview.css";
import { formatNote, Formats } from "../helpers/formatters.js";

export default function ChordPreview(props) {
    const { inViewport, forwardedRef } = props;
    const handleClick = () => {
        if(props.onClick) props.onClick(props.chord.name, props.chord.selectedInversion);
    }

    const notes = props.chord.selectedInversion !== 0 ? props.chord.inversions.find(inversion => inversion.inversion === props.chord.selectedInversion).notes : props.chord.notes;
    return(
        <div ref={forwardedRef} className="preview" onClick={handleClick}>
            <h3>{props.chord.name} {props.chord.selectedInversion > 0 ? `${props.chord.selectedInversion}te Invertierung` : ""}</h3>
            {inViewport ? <Notation tones={notes} treble/> : <div style={{height:"140px"}}>Loading...</div>}
            <p>{notes.map(note => formatNote(note, Formats.MUSICAL_NO_OCTAVE)).join(", ")}</p>
        </div>
    )
}

export const LazyChordPreview = handleViewport(ChordPreview, {}, {});