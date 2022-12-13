import inverseChordIndex from "../inverseChordIndex.json";

export const getAlternativeNoteNames = (note) => {
    switch (note) {
      case "C": return ["C", "Dbb"];
      case "H": return ["B", "Cb", "Ax"];
      case "B": return ["A#", "Bb"];
      case "A": return ["A", "Bbb", "Gx"];
      case "G#": return ["G#", "Ab"];
      case "G": return ["G", "Abb", "Fx"];
      case "F#": return ["F#", "Gb"];
      case "F": return ["F", "Gbb", "E#"];
      case "E": return ["E", "Fb", "Dx"];
      case "D#": return ["D#", "Eb"];
      case "D": return ["D", "Cx", "Ebb"];
      case "C#": return ["C#", "Db"];
      default: return [note];
    }
  };

  const perms = (head, tail) => {
    const permutations = [];
    for (let note of head) {
      let tailPerms = null;
      if (tail.length > 1) {
        tailPerms = perms(tail[0], tail.slice(1));
      } else {
        tailPerms = [...tail[0]];
      }
      for (let perm of tailPerms) {
        if (typeof perm === "string") perm = [perm];
        permutations.push([note, ...perm]);
      }
    }
    return permutations;
  };

  export const getValidChords = (notes) => {
    notes = notes.sort((a, b) => a.number-b.number).map(n => n.names);
    const permutations = perms(notes[0], notes.slice(1));
    const chords = [];
    for(let permutation of permutations.map(perm => perm.join("-"))){
      const chordNames = inverseChordIndex[permutation];
      if(chordNames) chords.push(...chordNames);
    }
    return chords
  }