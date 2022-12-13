export const compareNotes = (a, b, exact = false) => {
    if (exact) {
        return a.every((note, index) => b[index] === note) && a.length === b.length;
    }
    return a.every((note, index) => b[index] === note);
};

export const compareNames = (queryName, names, startsWithQueryName = false) => {
    for (let name of names) {
        if (name === queryName) return true;
        name = name.replace("Major", "Dur");
        name = name.replace("Minor", "Moll");
        name = name.replace("maj", "dur");
        name = name.replace("min", "moll");
        if (!startsWithQueryName && name === queryName) return true;
        if (startsWithQueryName && name.startsWith(queryName)) return true;
    }

    return false;
};