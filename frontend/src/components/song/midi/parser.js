const hexToBinary = (hex) => Number.parseInt(hex, 16).toString(2).padStart(8, "0");

const base64ToHex = (str) => {
    const raw = atob(str);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
        const hex = raw.charCodeAt(i).toString(16);
        result += (hex.length === 2 ? hex : '0' + hex);
    }
    return result.toUpperCase();
};

const readChunk = (bytes, offset = 0) => {
    const type = bytes.slice(offset + 0, offset + 4).map(byte => String.fromCharCode(Number.parseInt(byte, 16))).join("");
    const length = Number.parseInt(bytes.slice(offset + 4, offset + 8).join(""), 16);
    const data = bytes.slice(offset + 8, offset + 8 + length);
    return {
        nextChunk: offset + 8 + length,
        data,
        type
    };
};

const readHeader = (bytes) => {
    const format = Number.parseInt(bytes.slice(0, 2).join(""), 16);
    const numberOfTracks = Number.parseInt(bytes.slice(2, 4).join(""), 16);
    const divisionRaw = bytes.slice(4, 6).map(hex => hexToBinary(hex)).join("");
    if (divisionRaw.charAt(0) !== "0") console.log("ERROR: No Division!");
    const ticksPerBeat = Number.parseInt(divisionRaw.substring(1), 2);

    // console.log(format, numberOfTracks, ticksPerBeat);
    return {
        format,
        numberOfTracks,
        ticksPerBeat
    };
};

const readTimeSignature = (bytes) => {
    let nominator = Number.parseInt(bytes[0], 16);
    let denominantor = 1 / Math.pow(2, Number.parseInt(bytes[1], 16) * -1);
    let clocksPerClick = Number.parseInt(bytes[3], 16);

    return {
        nominator,
        denominantor,
        CPC: clocksPerClick
    };
};

const readKeySignature = (bytes) => {
    const major = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];
    const minor = ['Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#'];
    const sf = Number.parseInt(bytes[0], 16);
    const mi = Number.parseInt(bytes[1], 16);

    const circleOfFifth = (mi === 0 ? major : minor);

    return {
        key: circleOfFifth[sf + 7],
        major: mi === 0,
    };
};

const readSetTempo = (bytes) => {
    const microsecondsPerQuarterNote = Number.parseInt(bytes.join(""), 16);
    return {
        secondsPerQuarterNote: microsecondsPerQuarterNote / 1000000,
        microsecondsPerQuarterNote
    };
};

const readMetaEvent = (bytes) => {
    // 0 would be FF
    const type = Number.parseInt(bytes[1], 16);
    const length = readVariableLengthQuantity(bytes.slice(2));
    // currently just ignore data
    let data = bytes.slice(length.nextByte + 2, length.nextByte + 2 + length.quantity);
    switch (type) {
        case 88: data = readTimeSignature(data); break;
        case 89: data = readKeySignature(data); break;
        case 81: data = readSetTempo(data); break;
        default: data = [];
    }
    return {
        nextByte: 2 + length.nextByte + length.quantity,
        type,
        data
    };
};

const readSysex = (bytes) => {
    // 0 would be F0 oder F7
    const length = readVariableLengthQuantity(bytes.slice(1));
    // currently just ignore data
    const data = bytes.slice(length.nextByte + 1, length.nextByte + 1 + length.quantity);
    return {
        nextByte: 1 + length.nextByte + length.quantity,
        data
    };
};

const readStatus = (bytes, carriedStatus) => {
    let statusByte = hexToBinary(bytes[0]);
    if (statusByte.charAt(0) === "0") return {
        status: carriedStatus.status,
        channel: carriedStatus.channel,
        length: carriedStatus.length,
        nextByte: 0
    };

    const firstStatusNibble = statusByte.substring(0, 4);
    let numberOfDataBits = 0;
    if (firstStatusNibble === "1111" && statusByte !== "11110011") {
        numberOfDataBits = 0;
    } else if (firstStatusNibble === "1101" || firstStatusNibble === "1100" || statusByte === "11110011") {
        numberOfDataBits = 1;
    } else {
        numberOfDataBits = 2;
    }

    return {
        status: Number.parseInt(statusByte.substring(0, 4), 2),
        channel: Number.parseInt(statusByte.substring(4, 8), 2),
        length: numberOfDataBits,
        nextByte: 1,
    };
};

const readProgramChange = (bytes) => {
    // only first byte is of interest
    return {
        instrument: Number.parseInt(bytes[0], 16) + 1,
    };
};

const readControlChange = (bytes) => {
    // only first two bytes are of interest
    const control = Number.parseInt(bytes[0], 16) + 1;
    const value = Number.parseInt(bytes[1], 16);
    return {
        control,
        value
    };
};

const translateNote = (key) => {
    let octave = Math.floor(key / 12) - 1;
    let name = "";

    if (key % 12 === 0) name = "C";
    else if (key % 12 === 11) name = "B";
    else if (key % 12 === 10) name = "A#";
    else if (key % 12 === 9) name = "A";
    else if (key % 12 === 8) name = "G#";
    else if (key % 12 === 7) name = "G";
    else if (key % 12 === 6) name = "F#";
    else if (key % 12 === 5) name = "F";
    else if (key % 12 === 4) name = "E";
    else if (key % 12 === 3) name = "D#";
    else if (key % 12 === 2) name = "D";
    else if (key % 12 === 1) name = "C#";

    return `${name}${octave}`;
};

const readNoteOn = (bytes) => {
    const note = Number.parseInt(bytes[0], 16);
    const velocity = Number.parseInt(bytes[1], 16);

    return {
        note: translateNote(note),
        velocity,
        number: note
    };
};

// implement running status !!! that should be the reason why there are only 20 notes on being send, and note on with velocity 0 should be considered note of
const readMidiMessage = (bytes, carriedStatus) => {
    let status = readStatus(bytes, carriedStatus);

    let data = status.length > 0 ? bytes.slice(status.nextByte, status.nextByte + status.length) : [];

    switch (status.status) {
        case 12: data = readProgramChange(data); break;
        case 11: data = readControlChange(data); break;
        case 9: data = readNoteOn(data); break;
        case 8: data = readNoteOn(data); break;
        default:
    }

    return {
        data,
        status,
        nextByte: status.nextByte + status.length
    };
};

const readVariableLengthQuantity = (bytes) => {
    let byte = hexToBinary(bytes[0]);
    let byteIndex = 0;
    let number = byte.substring(1);
    while (byte.charAt(0) !== "0") {
        byteIndex += 1;
        byte = hexToBinary(bytes[byteIndex]);
        number += byte.substring(1);
    }
    return {
        quantity: Number.parseInt(number, 2),
        nextByte: byteIndex + 1
    };
};

const readTrack = (bytes, ticksPerBeat) => {
    const midiEvents = [];
    const trackHeader = {
        tempo: {
            microsecondsPerQuarter: null,
            secondsPerQuarter: null
        },
        key: null
    };
    let runningStatus = null;
    let offset = 0;
    let absoluteTime = 0;
    while (offset < bytes.length) {
        const deltaTime = readVariableLengthQuantity(bytes.slice(offset));
        offset += deltaTime.nextByte;
        absoluteTime += deltaTime.quantity;
        const eventIdentifier = Number.parseInt(bytes[offset], 16);
        if (eventIdentifier === 255) {
            const metaEvent = readMetaEvent(bytes.slice(offset));

            switch (metaEvent.type) {
                case 81:
                    trackHeader.tempo.microsecondsPerQuarter = metaEvent.data.microsecondsPerQuarterNote;
                    trackHeader.tempo.secondsPerQuarter = metaEvent.data.secondsPerQuarterNote;
                    break;
                case 89:
                    trackHeader.key = metaEvent.data;
                    break;
                default:
            }

            offset += metaEvent.nextByte;
        } else if (eventIdentifier === 240 || eventIdentifier === 247) {
            const sysex = readSysex(bytes.slice(offset));
            offset += sysex.nextByte;
        } else {
            const midiMessage = readMidiMessage(bytes.slice(offset), runningStatus);
            runningStatus = midiMessage.status;
            midiEvents.push({
                type: midiMessage.status.status,
                channel: midiMessage.status.channel,
                time: {
                    start: absoluteTime,
                },
                ...midiMessage.data
            });

            offset += midiMessage.nextByte;
        }
    }

    return {
        header: trackHeader,
        events: midiEvents
    };
};

export default function parseMIDI(base64) {
    const bytes = base64ToHex(base64).match(/\S\S/g);

    let offset = 0;
    let header = null;
    let tracks = [];
    while (offset < bytes.length) {
        const chunk = readChunk(bytes, offset);
        if (chunk.type === "MThd") header = readHeader(chunk.data);
        if (chunk.type === "MTrk") tracks.push(readTrack(chunk.data));
        offset = chunk.nextChunk;
    }

    //raise timing information to header
    const tempi = tracks.filter(track => track.header.tempo.secondsPerQuarter !== null).map(
        track => {
            let tempo = track.header.tempo;
            tempo["ticksPerQuarter"] = header.ticksPerBeat;
            tempo["BPM"] = 60000000 / track.header.tempo.microsecondsPerQuarter;
            tempo["microsecondsPerTick"] = tempo.microsecondsPerQuarter / tempo.ticksPerQuarter;
            tempo["secondsPerTick"] = tempo.secondsPerQuarter / tempo.ticksPerQuarter;
            return tempo;
        }
    );
    
    if (tempi.length === 0) {
        tempi.push({
            microsecondsPerQuarter: 666667,
            secondsPerQuarter: 0.666667,
            ticksPerQuarter: 480,
            BPM: 89.9999550000225,
            microsecondsPerTick: 1388.8895833333333,
            secondsPerTick: 0.0013888895833333334
        });
    }

    let lastInstrument = null;

    tracks = tracks.map(track => {
        const instrument = track.events.find(event => event.type === 12)?.instrument || lastInstrument;
        const channel = track.events.find(event => event.type === 9)?.channel;
        lastInstrument = instrument;
        track.header.channel = channel;
        track.header.instrument = instrument;
        track.events = track.events.map((event, index, array) => {
            if (event.type === 9 && event.velocity > 0) {
                let correspondingKeyRelease = null;
                let lookAhead = index + 1;
                while (correspondingKeyRelease === null && lookAhead < array.length) {
                    if ((array[lookAhead].type === 9 || array[lookAhead].type === 8) && array[lookAhead].number === event.number && array[lookAhead].velocity === 0) {
                        correspondingKeyRelease = array[lookAhead];
                        break;
                    }
                    lookAhead++;
                }

                event.time["stop"] = correspondingKeyRelease.time.start;
                event.time["delta"] = event.time.stop - event.time.start;
            }

            return event;
        }).filter(event => event.type === 9 && event.velocity > 0);
        return track;
    }).filter(track => track.events.length > 0);

    for (let track of tracks) {
        delete track.header.tempo;
    }

    const decoratedHeader = {
        numberOfTracks: header.numberOfTracks,
        tempo: tempi
    };

    return {
        header: decoratedHeader,
        tracks
    };
}