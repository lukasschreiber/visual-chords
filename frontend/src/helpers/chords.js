import inverseChordIndex from "../inverseChordIndex.json";
import { formatNote, formatNumber, Formats } from "./formatters.js";

export const getAlternativeNoteNames = (note) => {
    switch (note) {
        case "C": return ["C", "Dbb", "Bs"];
        case "B": return ["B", "Cb", "Ax"];
        case "A#": return ["A#", "Bb"];
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

export const translateSharpToFlat = (note) => {
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    const octave = note.match(/\d+$/g)[0];
    const pitch = notes.indexOf(note.match(/^[A-H]/g)[0]);
    if(note.match(/#/g)){
        note = notes[pitch + 1 < notes.length ? pitch + 1 : 0] + "b" + octave;
    }

    return note;
}

export const translateFlatToSharp = (note) => {
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    const octave = note.match(/\d+$/g)[0];
    const pitch = notes.indexOf(note.match(/^[A-H]/g)[0]);
    if(note.match(/b/g)){
        note = notes[pitch - 1 >= 0 ? pitch - 1 : notes.length - 1] + "#" + octave;
    }

    return note;
}

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
    notes = notes.sort((a, b) => a.number - b.number).map(n => n.names);
    const permutations = perms(notes[0], notes.slice(1));
    const chords = [];
    for (let permutation of permutations.map(perm => perm.join("-"))) {
        const chordNames = inverseChordIndex[permutation];
        if (chordNames) chords.push(...chordNames);
    }
    return chords;
};

export const getChordDescription = (name, keynote) => {
    name = name.replace(formatNote(keynote, Formats.NORMALIZED), "");
    const descriptions = [];
    for (let rule of rules) {
        if (name.match(rule.match)) {
            let description = rule.description;
            if (typeof description === "function") description = description(name.match(rule.numbers ? rule.match : numberAtEnd));
            descriptions.push({ keywords: description, definition: rule.definition, defintionMatcher: rule.definitionMatch });
        }
    }
    return {
        keynote: formatNote(keynote, Formats.MUSICAL),
        keywords: descriptions.map(d => d.keywords),
        definitions: descriptions
    };
};

const numberAtEnd = /(0*(?:[1-9][0-3]?))(?=\d|b|\b|m)/g;
const rules = [
    {
        match: /m/g,
        description: "Minor",
        definitionMatch: /Minor/g,
        definition: `In music theory, a minor chord is a chord that has a root, a minor third, and a perfect fifth. When a chord comprises only these three notes, it is called a minor triad. For example, the minor triad built on C, called a C minor triad, has pitches C–E♭–G`
    },
    {
        match: /^$|M/g,
        description: "Major",
        definitionMatch: /Major/g,
        definition: `In music theory, a major chord is a chord that has a root, a major third, and a perfect fifth. When a chord comprises only these three notes, it is called a major triad. For example, the major triad built on C, called a C major triad, has pitches C–E–G`
    },
    {
        match: /\+/g,
        description: "Augmented",
        definitionMatch: /Augmented/g,
        definition: `An augmented triad is a chord, made up of two major thirds (an augmented fifth). The term augmented triad arises from an augmented triad being considered a major chord whose top note (fifth) is raised. When using popular-music symbols, it is indicated by the symbol "+" or "aug". For example, the augmented triad built on C, written as C+, has pitches C–E–G♯`
    },
    {
        match: /°|o|Ø/g,
        description: "Diminished",
        definitionMatch: /Diminished/g,
        definition: `In music theory, a diminished triad (also known as the minor flatted fifth) is a triad consisting of two minor thirds above the root. It is a minor triad with a lowered (flattened) fifth. When using chord symbols, it may be indicated by the symbols "dim", "o", "m♭5", or "MI(♭5)". However, in most popular-music chord books, the symbol "dim" and "o" represents a diminished seventh chord (a four-tone chord), which in some modern jazz books and music theory books is represented by the "dim7" or "o7" symbols. For example, the diminished triad built on C, written as Co, has pitches C–E♭–G♭`
    },
    {
        numbers: true,
        match: /(?<=sus\d?\d?b?)(0*(?:b?[1-9][0-3]?))(?=\d|b|\b|m)/g,
        description: (numbers) => `Suspended ${formatNumber(numbers[0], Formats.Number.SHORT)}${numbers.length > 1 ? ` and ${formatNumber(numbers[1], Formats.Number.SHORT)}` : ""}`,
        definitionMatch: /Suspended\s[0-9]+(st|nd|th)/g,
        definition: `A suspended chord (or sus chord) is a musical chord in which the (major or minor) third is omitted and replaced with a perfect fourth or a major second. The lack of a minor or a major third in the chord creates an open sound, while the dissonance between the fourth and fifth or second and root creates tension. When using popular-music symbols, they are indicated by the symbols "sus4" and "sus2". For example, the suspended fourth and second chords built on C (C–E–G), written as Csus4 and Csus2, have pitches C–F–G and C–D–G, respectively.`
    },
    {
        numbers: false,
        match: /add[0-9]/g,
        description: (numbers) => `Added ${formatNumber(numbers[0], Formats.Number.SHORT)}`,
        definitionMatch: /Added\s[0-9]+(st|nd|th)/g,
        definition: `An added tone chord, or added note chord, is a non-tertian chord composed of a triad and an extra "added" note. Any tone that is not a seventh factor is commonly categorized as an added tone. It can be outside the tertian sequence of ascending thirds from the root, such as the added sixth or fourth, or it can be in a chord that doesn't consist of a continuous stack of thirds, such as the added thirteenth (six thirds from the root, but the chord doesn't have the previous tertian notes – the seventh, ninth or eleventh). The concept of added tones is convenient in that all notes may be related to familiar chords.`
    },
    {
        numbers: true,
        match: /(?<!add|add\d+?b?\d?|sus\d+?b?\d?|sus|no|susb?\d?)b?♯?(0*(?:b?[1-9][0-3]?))(?=\d|b|\b|m|sus|add)/g,
        description: (numbers) => `${(numbers.length === 1 ? numbers : numbers.slice(0, -1)).map(number => formatNumber(number, Formats.Number.LONG)).join(", ")}${numbers.length > 1 ? ` and ${formatNumber(numbers.at(-1), Formats.Number.LONG)}` : ""}`
    },
    {
        numbers: true,
        match: /(?<=no)[0-9]+/g,
        description: (numbers) => `${(numbers.length === 1 ? numbers : numbers.slice(0, -1)).map(number => `without ${formatNumber(number, Formats.Number.LONG)}`).join(", ")}${numbers.length > 1 ? ` and without ${formatNumber(numbers.at(-1), Formats.Number.LONG)}` : ""}`
    }
];