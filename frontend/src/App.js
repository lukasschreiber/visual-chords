import Search from "./components/Search";
import chords from "./chords.json";
import { useEffect, useState } from "react";
import { LazyChordPreview } from "./components/ChordPreview";
import Chord from "./components/Chord";
import { getAlternativeNoteNames, getValidChords } from "./helpers/chords.js";
import { compareNames, compareNotes } from "./helpers/comparators.js";

function App() {
  const [query, setQuery] = useState(null);
  const [results, setResults] = useState([]);
  const [chord, setChord] = useState("");
  const [inversion, setInversion] = useState(0);
  const [midi, setMidi] = useState(null);
  const [activeNotes, setActiveNotes] = useState([]);
  const [mode, setMode] = useState("Filter");

  const getInversion = (chord, notes) => {
    if (compareNotes(chord.notes, notes)) return 0;
    return chord.inversions.find(inversion => compareNotes(inversion.notes, notes)).inversion;
  };


  useEffect(() => {
    if (query) {
      if (query.mode === "Notes" && query.notes.length > 0) {
        setMode("Notes");
        const res = Object.values(chords).filter(chord => compareNotes(chord.notes, query.notes) || chord.inversions.some(inversion => compareNotes(inversion.notes, query.notes)));
        setResults(res.map(r => {
          const inversion = getInversion(r, query.notes);
          const referenceNotes = inversion !== 0 ? r.inversions.find(i => i.inversion === inversion).notes : r.notes;
          return {
            ...r,
            selectedInversion: inversion,
            exactMatch: compareNotes(referenceNotes, query.notes, true)
          };
        }));
      } else if (query.mode === "Chord") {
        setMode("Chord");
        const res = Object.values(chords).filter(chord => compareNames(query.name, [...chord.alternate, chord.name], true));
        setResults(res.map(r => {
          return {
            ...r,
            selectedInversion: query.inversion <= r.inversions.length ? query.inversion : 0,
            exactMatch: compareNames(query.name, [...r.alternate, r.name])
          };
        }));
      } else {
        setMode("Filter")
        const res = Object.values(chords).filter(chord => compareNames(query.name, [...chord.alternate, chord.name], true));
        setResults(res.map(r => {
          return {
            ...r,
            selectedInversion: query.inversion <= r.inversions.length ? query.inversion : 0,
            exactMatch: false
          };
        }));
      }
    }
  }, [query]);

  if (results.length === 0) {
    setResults(Object.values(chords).map(r => {
      return {
        ...r,
        selectedInversion: 0,
        exactMatch: false
      };
    }));
  }


  const onMIDISuccess = (midiAccess) => {
    console.log("MIDI ready!");
    midiAccess.inputs.forEach(function (entry) { entry.onmidimessage = onMIDIMessage; });
    setMidi(midiAccess);
  };

  const onMIDIMessage = (event) => {
    handleNoteInput(event.data[0], event.data[1], event.data[2], event.timeStamp);
  };

  const onMIDIFailure = (error) => {
    console.log("Failed to get MIDI access - " + error);
  };

  const handleNoteInput = (control, pitch, velocity, timestamp) => {
    if (control === 248) return;

    if (control === 144) {
      let currentNote = getNote(pitch);
      if (velocity !== 0) {
        // add note
        setActiveNotes(state => uniq([...state, currentNote]));
      } else {
        // remove note
        setActiveNotes(state => state.filter(note => note.number !== currentNote.number));
      }
    }
  };

  const uniq = (array) => {
    const seen = {};
    return array.filter((item) => {
      const itemKey = JSON.stringify(item);
      return seen.hasOwnProperty(itemKey) ? false : (seen[itemKey] = true);
    });
  };

  const getNote = (pitch) => {
    const note = {
      octave: Math.floor(pitch / 12) - 1,
      number: pitch,
      frequency: Math.pow(2, (pitch - 69) / 12) * 440
    };

    if (pitch % 12 === 0) note.name = "C";
    else if (pitch % 12 === 11) note.name = "H";
    else if (pitch % 12 === 10) note.name = "B";
    else if (pitch % 12 === 9) note.name = "A";
    else if (pitch % 12 === 8) note.name = "G#";
    else if (pitch % 12 === 7) note.name = "G";
    else if (pitch % 12 === 6) note.name = "F#";
    else if (pitch % 12 === 5) note.name = "F";
    else if (pitch % 12 === 4) note.name = "E";
    else if (pitch % 12 === 3) note.name = "D#";
    else if (pitch % 12 === 2) note.name = "D";
    else if (pitch % 12 === 1) note.name = "C#";

    return {
      number: note.number,
      names: getAlternativeNoteNames(note.name)
    };
  };

  useEffect(() => {
    if (!midi) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }
  }, [midi]);

  useEffect(() => {
    //activeNotes has been updated
    if (activeNotes.length <= 1) return;

    // get all possible permutations
    const chords = getValidChords(activeNotes);
    if(chords.length <= 0) return;

    console.log(chords);
    let chord = chords[0];
    let inversion = chords[0].match(/\/[0-4]/g);
    setChord(chord);
    setInversion(inversion ? inversion[0] : 0);

  }, [activeNotes]);

  let presentedResult = null;
  let restOfResults = results;

  if(mode === "Filter"){
    restOfResults = results;
  }else {
    presentedResult = (results.length === 1 || results.filter(r => r.exactMatch).length === 1) ? (results.length === 1 ? results[0] : results.find(r => r.exactMatch)) : null;
    restOfResults = presentedResult ? results.filter(result => result.name !== presentedResult.name) : results;
  }

  const handlePreviewClick = (name, inv) => {
    setChord(name);
    setInversion(inv);
  };

  return (
    <div>
      <Search onChange={setQuery} chord={chord} inversion={inversion} />

      <div className="previewWrapper">
        {!presentedResult && restOfResults.length === 0 ? "Nothing" : ""}
        {presentedResult ? <Chord chord={presentedResult} /> : ""}
        {restOfResults.length > 0 ? restOfResults.map(result => <LazyChordPreview chord={result} onClick={handlePreviewClick} />) : ""}
      </div>
    </div>
  );
}

export default App;
