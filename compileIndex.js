import chordsJSON from "./chords.json" assert { type: 'json' };
import fs from "fs";

const chords = Object.values(chordsJSON);
const bins = {};

const getBin = (notes) => notes.join("-").replaceAll("♭", "b").replaceAll("♯", "#")

for(let chord of chords){
    let bin = getBin(chord.notes);
    if(!bins[bin]) bins[bin] = [];
    bins[bin].push(chord.name);
    for(let inversion of chord.inversions){
        bin = getBin(inversion.notes);
        if(!bins[bin]) bins[bin] = [];
        bins[bin].push(`${chord.name}/${inversion.inversion}`);
    }
}

fs.writeFileSync("inverseChordIndex.json", JSON.stringify(bins));
