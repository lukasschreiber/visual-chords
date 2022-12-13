const normalize = (note) => {
    return note.replaceAll("♭", "b")
            .replaceAll("𝄫", "bb")
            .replaceAll("#", "s")
            .replaceAll("𝄪", "x")
            .replaceAll("♯", "s")
            .replaceAll("ss", "x")
            .trim()
}

const removeOctave = (note) => {
    return note.replaceAll(/[0-9]|\/[0-9]/g, "");
}

const formatMusically = (note) => {
    return note.replaceAll("bb", "𝄫")
            .replaceAll("b", "♭")
            .replaceAll("x", "𝄪")
            .replaceAll("s", "♯")
            .trim()
}

const formatStandard = (note) => {
    return note.replaceAll("s", "#")
            .trim()
}

export const Formats = {
    NORMALIZED_NO_OCTAVE: 0,
    NORMALIZED: 1,
    MUSICAL_NO_OCTAVE: 2,
    MUSICAL: 3,
    STANDARD: 4,
    STANDARD_NO_OCTAVE: 5
}

export const formatNote = (note, format = Formats.MUSICAL_NO_OCTAVE) => {
    note = normalize(note);
    switch(format) {
        case Formats.NORMALIZED: return note;
        case Formats.NORMALIZED_NO_OCTAVE: return removeOctave(note);
        case Formats.MUSICAL: return formatMusically(note);
        case Formats.MUSICAL_NO_OCTAVE: return formatMusically(removeOctave(note));
        case Formats.STANDARD: return formatStandard(note);
        case Formats.STANDARD_NO_OCTAVE: return formatStandard(removeOctave(note));
        default: return note;
    }
}