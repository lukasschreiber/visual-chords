import chordsJSON from "./chords.json" assert { type: 'json' };
import fs from "fs";

// for now just take these duplicates, no need to find any...
const chords = Object.values(chordsJSON);
const bins = {};

for(let chord of chords){
    const bin = chord.notes.join("-");
    if(!bins[bin]) bins[bin] = [];
    bins[bin].push(chord.name);

}

const duplicates = Object.values(bins).filter(bin => bin.length > 1);

for(let duplicate of duplicates) {
    chordsJSON[duplicate[1]].alternate = Array.from(new Set([
        ...chordsJSON[duplicate[1]].alternate,
        ...chordsJSON[duplicate[0]].alternate,
        chordsJSON[duplicate[0]].name
    ]))
    delete chordsJSON[duplicate[0]];
}

fs.writeFileSync('chords.json', JSON.stringify(chordsJSON));
