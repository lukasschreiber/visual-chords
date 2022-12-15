import Soundfont from "soundfont-player";
import parseMIDI from "./midi/parser";
import songs from "./midi/songs.json";

export default function PlaySong(props) {
    const song = props.name ? songs[props.name] : null;


    const handleClick = async (e) => {
        if (!song) return;
        //https://github.com/danigb/soundfont-player
        const context = new AudioContext();

        const midi = parseMIDI(song.midi);
        console.log(midi)
        console.log(midi.tracks.map(track => track.header))

        const tracks = [];
        const timePerTick = midi.header.tempo[0].secondsPerTick;
        for (let track of midi.tracks) {
            const voice = song.voices.find(voice => voice.channel === track.header.channel);
            const instrument = await Soundfont.instrument(context, voice.instrument, { gain: voice.gain || 1});
            const schedule = [];

            for (let note of track.events) {
                const tone = {
                    time: note.time.start * timePerTick,
                    duration: note.time.delta * timePerTick,
                    note: note.note
                };
                schedule.push(tone);
            }
            tracks.push({ instrument, schedule });
        }

        for (let voice of tracks) {
            voice.instrument.schedule(context.currentTime, voice.schedule);
        }
    };

    return (
        <img style={{ cursor: "pointer", height: "50px" }} onClick={handleClick} src={`/icons/${props.icon || "piano"}.png`} alt={props.icon || "piano"} />
    );
}

// const renderPianoKeys = (time, data) => {
//     setTimeout(() => {
//         playedNotes.push(data.note);
//         setTimeout(() => {
//             playedNotes = playedNotes.filter(n => n !== data.note);
//         }, data.duration * 1000 - 50);

//         const highlightedKeys = props.piano.current.querySelectorAll(".active");
//         for (let key of highlightedKeys) {
//             const note = playedNotes.find(note => key.classList.contains(formatNote(note, Formats.NORMALIZED_NO_OCTAVE)));
//             if (note) {
//                 key.innerHTML = formatNote(note, Formats.MUSICAL_NO_OCTAVE);
//                 key.classList.add("fade");
//                 setTimeout(() => {
//                     key.classList.remove("fade");
//                     key.classList.add("fadeout");
//                 }, data.duration * 1000 - 500);
//                 setTimeout(() => {
//                     key.classList.remove("fadeout");
//                 }, data.duration * 1000);
//             }
//             if (!note) key.innerHTML = "";
//         }
//     }, time * 1000);
// };