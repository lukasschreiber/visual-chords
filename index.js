import chords from "./chords.json" assert { type: 'json' };

const arrayEquals = (a, b) => {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
};

const chord = Object.values(chords).filter(chord => arrayEquals(chord.notes, ['C', 'E♭', 'G'])).map(chord => chord.name);
console.log(chord);