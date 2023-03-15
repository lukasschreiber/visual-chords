import { translateFlatToSharp } from "../../../helpers/chords";

const jsToJSON = (js) => {
    let match = js.match(/\{\n?("\S+":\s?"\S+",?\n?)+\n?\s?\}/gm)[0];
    match = match.replace(/,(?=\n+?\})/gm, "");
    return JSON.parse(match);
};

const renameFlatToSharp = (obj) => {
    for (let key in obj) {
        let flat = translateFlatToSharp(key);
        if (flat !== key) {
            obj[translateFlatToSharp(key)] = obj[key];
            delete obj[key];
        }
    }
    return obj;
};

const DEFAULTS = {
    loop: false,
};

/**
 * Play a note
 * 
 * @param {AudioContext} context 
 * @param {Object} soundfont 
 * @param {String} note 
 * @param {Object} options 
 */
const play = (context, buffer, velocity, time, duration, options = {}) => {
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.setValueAtTime((options.gain || 1) * velocity / 80, 0);
    source.buffer = buffer;
    source.loop = options.loop !== null ? options.loop : DEFAULTS.loop; //only for some instruments, pass as options
    source.connect(gain);
    gain.connect(context.destination);
    source.start(time);

    source.stop(duration + time + 0.03);
    return {
        stop: (stop = 0) => source.stop(stop)
    };
};

/**
 * 
 * @param {AudioContext} context 
 * @param {Array} buffers 
 * @param {Array} notes 
 * @param {Object} options 
 * @returns 
 */
const schedule = (context, buffers, notes, options) => {
    const lookAhead = 3;
    const buffer = 3; // seems to have issues if lookAhead !== buffer

    const scheduleBins = [];

    // makes problems if last bin only contains one element
    for (let i = 0; i < Math.ceil(notes[notes.length - 1].time); i += lookAhead) {
        scheduleBins.push(notes.filter(note => note.time >= i && note.time < i + lookAhead));
    }

    for (let i = 0; i < scheduleBins.length; i++) {
        let scheduleTime = (i * lookAhead - buffer < 0 ? 0 : i * lookAhead - buffer) * 1000;
        let schedule = scheduleBins[i];

        setTimeout(() => {
            for (let note of schedule) {
                play(context, buffers[note.note], note.velocity || 80, note.time, note.duration, options);
            }
        }, scheduleTime);
    }

    if (typeof options.onScheduled === "function") options.onScheduled(notes);

    return {

    };
};


/**
 * Instrument
 * 
 * @param {AudioContext} context 
 * @param {String} instrument 
 * @param {Object} options 
 * @returns 
 */
const instrument = async (context, instrument, options = {}) => {
    const url = `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${instrument}-mp3.js`; // also available as gz
    const soundfont = await fetch(url).then(res => res.text()).then(jsToJSON).then(renameFlatToSharp);
    const bufferPromises = [];
    const bufferKeys = [];
    const buffers = {};

    if (options.notes) options.notes = options.notes.map(translateFlatToSharp);

    for (let note in soundfont) {
        if (!options.notes || options.notes.includes(note)) {
            bufferKeys.push(note);
            bufferPromises.push(fetch(soundfont[note]).then(res => res.arrayBuffer()).then(buf => context.decodeAudioData(buf)));
        }
    }
    const decodedBuffers = await Promise.all(bufferPromises);
    for (let i = 0; i < bufferKeys.length; i++) {
        buffers[bufferKeys[i]] = decodedBuffers[i];
    }

    return {
        play: (note, time = 0, duration = 3, velocity = 80) => play(context, buffers[translateFlatToSharp(note)], velocity, time, duration, options),
        schedule: (notes) => schedule(context, buffers, notes.map(note => {
            return {
                ...note,
                note: translateFlatToSharp(note.note)
            };
        }), options),
        name: instrument
    };
};

const Player = {};
Player.instrument = instrument;

export { Player };