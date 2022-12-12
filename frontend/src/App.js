import Search from "./components/Search";
import chords from "./chords.json";
import { useEffect, useState } from "react";
import { LazyChordPreview } from "./components/ChordPreview";
import Chord from "./components/Chord";

function App() {
  const [query, setQuery] = useState(null);
  const [results, setResults] = useState([]);
  const [chord, setChord] = useState("");
  const [midi, setMidi] = useState(null);
  const [activeNotes, setActiveNotes] = useState([]);

  const matchesNotes = (chord, notes, exact = false) => {
    if (exact) {
      return notes.every((note, index) => chord[index] === note) && notes.length === chord.length;
    }
    return notes.every((note, index) => chord[index] === note);
  };

  const matchesAnyName = (names, queryName) => {
    for (let name of names) {
      if (name === queryName) return true;
      name = name.replace("Major", "Dur");
      name = name.replace("Minor", "Moll");
      name = name.replace("maj", "dur");
      name = name.replace("min", "moll");
      if (name === queryName) return true;
    }

    return false;
  };

  const getInversion = (chord, notes) => {
    if (matchesNotes(chord.notes, notes)) return 0;
    return chord.inversions.find(inversion => matchesNotes(inversion.notes, notes)).inversion;
  };


  useEffect(() => {
    if (query) {
      if (query.mode === "Notes" && query.notes.length > 0) {
        const res = Object.values(chords).filter(chord => matchesNotes(chord.notes, query.notes) || chord.inversions.some(inversion => matchesNotes(inversion.notes, query.notes)));
        setResults(res.map(r => {
          const inversion = getInversion(r, query.notes);
          const referenceNotes = inversion !== 0 ? r.inversions.find(i => i.inversion === inversion).notes : r.notes;
          return {
            ...r,
            selectedInversion: inversion,
            exactMatch: matchesNotes(referenceNotes, query.notes, true)
          };
        }));
      } else if (query.mode === "Chord") {
        const res = Object.values(chords).filter(chord => matchesAnyName([...chord.alternate, chord.name], query.name));
        setResults(res.map(r => {
          return {
            ...r,
            selectedInversion: 0,
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
      let currentNote = getNote(pitch, velocity);
      if (velocity !== 0) {

        // add note
        activeNotes.push(currentNote);
        
        console.log(Array.from(new Set(activeNotes)).map(n => n.name))
      } else {
        // remove note
        console.log(currentNote.number, activeNotes.filter(note => note.number !== currentNote.number))
        setActiveNotes([]);
      }
    }
  };

  const getNote = (pitch, velocity) => {
    const note = {
      octave: Math.floor(pitch / 12) - 1,
      velocity: velocity,
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

    let octaveFromZero = Math.floor(pitch / 12);
    if (octaveFromZero >= 4) note.longName = `${note.name.toLowerCase()}${("'").repeat(octaveFromZero - 4)}`;
    else note.longName = `${note.name.toUpperCase()}${("'").repeat(3 - octaveFromZero)}`;

    return note;
  };

  useEffect(() => {
    if(!midi){
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }
  }, [midi])

  const presentedResult = results.length === 1 || results.filter(r => r.exactMatch).length === 1 ? (results.length === 1 ? results[0] : results.find(r => r.exactMatch)) : null;
  const restOfResults = presentedResult ? results.filter(result => result.name !== presentedResult.name) : results;

  return (
    <div>
      <Search onChange={setQuery} chord={chord} />

      <div className="previewWrapper">
        {!presentedResult && restOfResults.length === 0 ? "Nothing" : ""}
        {presentedResult ? <Chord chord={presentedResult} /> : ""}
        {restOfResults.length > 0 ? restOfResults.map(result => <LazyChordPreview chord={result} onClick={setChord} />) : ""}
      </div>
    </div>
  );
}

export default App;
