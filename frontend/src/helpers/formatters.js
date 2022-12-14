const normalize = (note) => {
    return note.replaceAll("♭", "b")
        .replaceAll("𝄫", "bb")
        .replaceAll("#", "s")
        .replaceAll("𝄪", "x")
        .replaceAll("♯", "s")
        .replaceAll("ss", "x")
        .trim();
};

const removeOctave = (note) => {
    return note.replaceAll(/[0-9]|\/[0-9]/g, "");
};

const formatMusically = (note) => {
    return note.replaceAll("bb", "𝄫")
        .replaceAll("b", "♭")
        .replaceAll("x", "𝄪")
        .replaceAll("s", "♯")
        .trim();
};

const formatStandard = (note) => {
    return note.replaceAll("s", "#")
        .trim();
};

export const Formats = {
    NORMALIZED_NO_OCTAVE: 0,
    NORMALIZED: 1,
    MUSICAL_NO_OCTAVE: 2,
    MUSICAL: 3,
    STANDARD: 4,
    STANDARD_NO_OCTAVE: 5,
    Number: {
        LONG: 0,
        SHORT: 1,
    }
};

export const formatNote = (note, format = Formats.MUSICAL_NO_OCTAVE) => {
    note = normalize(note);
    switch (format) {
        case Formats.NORMALIZED: return note;
        case Formats.NORMALIZED_NO_OCTAVE: return removeOctave(note);
        case Formats.MUSICAL: return formatMusically(note);
        case Formats.MUSICAL_NO_OCTAVE: return formatMusically(removeOctave(note));
        case Formats.STANDARD: return formatStandard(note);
        case Formats.STANDARD_NO_OCTAVE: return formatStandard(removeOctave(note));
        default: return note;
    }
};

export const formatNumber = (number, format = Formats.Number.SHORT) => {
    let flat = number.startsWith("b");
    let sharp = number.startsWith("♯");
    if(flat || sharp) number = number.slice(1);
    number = parseInt(number);
    if (number <= 0) return number;
    if (format === Formats.Number.SHORT) {
        switch (number) {
            case 1: number = "1st"; break;
            case 2: number = "2nd"; break;
            case 3: number = "3rd"; break;
            default: number = `${number}th`;
        }
    }

    if (format === Formats.Number.LONG) {
        switch (number) {
            case 1: number = "First"; break;
            case 2: number = "Second"; break;
            case 3: number = "Third"; break;
            case 4: number = "Fourth"; break;
            case 5: number = "Fifth"; break;
            case 6: number = "Sixth"; break;
            case 7: number = "Seventh"; break;
            case 8: number = "Eighth"; break;
            case 9: number = "Ninth"; break;
            default: number = `${number}th`;
        }
    }

    if(flat) number = `Flat ${number}`;
    if(sharp) number = `Sharp ${number}`;

    return number;
};