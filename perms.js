const notes = [
    [
        "C",
        "Dbb"
    ],
    [
        "E",
        "Fb",
        "Dx"
    ],
    [
        "F#",
        "Gb"
    ],
    [
        "A",
        "Bbb",
        "Gx"
    ],
    [
        "B"
    ]
];

const singleElement = [
    ["G", "E"]
];

const permsIt = (array) => {
    if (array === null) return null;
    if (array.length === 0) return [];
    const permutationsCount = array.reduce((acc, x) => acc * x.length, 1);
    const permutations = new Array(permutationsCount).fill([]);

    let prevLength = permutationsCount;
    for (let i = 0; i < array.length; i++) {
        let items = array[i];
        prevLength = prevLength / items.length;

        let k = 0;
        for (let j = 0; j < permutationsCount; j++) {
            if (j % prevLength === 0 && j > 0) {
                if (k < items.length - 1) {
                    k++;
                } else {
                    k = 0;
                }
            }
            permutations[j] = [...permutations[j], items[k]];
        }
    }
    return permutations;
};


// cannot handle tail === []

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

const permsRec = (notes) => {
    if (notes === null) return null;
    if (notes.length === 0) return [];
    if (notes.length === 1) return notes[0].map(n => [n]);
    return perms(notes[0], notes.slice(1));
};

const comparePerms = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
};

console.log(comparePerms(permsRec(notes), permsIt(notes)));

console.log(permsRec(notes));
console.log(permsIt(notes));