import Soundfont from "soundfont-player";
import { formatNote, Formats } from "../helpers/formatters.js";

export default function PlayChord(props) {

    const octave = props.octave || 4;

    const possibleTones = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allPossibleTones = [`A${octave - 1}`, `B${octave - 1}`].concat(...possibleTones.map(tone => `${tone}${octave}`)).concat(...possibleTones.map(tone => `${tone}${octave + 1}`)).concat(...possibleTones.map(tone => `${tone}${octave + 2}`));

    const getTones = (tones) => {
        const tonesToPlay = [];
        let currentToneIndex = 0;
        for (let tone of allPossibleTones) {
            if (tone.startsWith(tones[currentToneIndex].charAt(0))) {
                tone = formatNote(tone.replace(tone.charAt(0), tones[currentToneIndex]), Formats.STANDARD);
                tonesToPlay.push(`${tone}`);
                if (tonesToPlay.length === tones.length) break;
                currentToneIndex++;
            }
        }
        return tonesToPlay;
    };

    const handleClick = (e) => {
        //https://github.com/danigb/soundfont-player
        const context = new AudioContext();
        Soundfont.instrument(context, props.instrument || 'acoustic_grand_piano').then(function (piano) {
            let tones = getTones(props.tones);
            const schedule = [];
            let duration = 0;

            if (props.sequence) {
                duration += tones.length;
                schedule.push(...tones.map((tone, i) => {
                    return {
                        time: i,
                        note: tone,
                        duration: 1
                    };
                }));
            }

            if (!props.sequence || (props.sequence && !props.nochord)) {
                duration += 2;
                let lastTone = Math.max(...schedule.map(n => n.time)) || -1;
                schedule.push(...tones.map(tone => {
                    return {
                        time: lastTone + 1,
                        note: tone,
                        duration: 2
                    };
                }));
            }

            let playedNotes = [];

            piano.on("start", (time, note, data) => {
                if (props.piano) {

                    renderPianoKeys(time, data);

                    // cleanup
                    setTimeout(() => {
                        props.piano.current.querySelectorAll(".active").forEach(key => key.innerHTML = "");
                    }, duration * 1000);
                }
            });

            const renderPianoKeys = (time, data) => {
                setTimeout(() => {
                    playedNotes.push(data.note);
                    setTimeout(() => {
                        playedNotes = playedNotes.filter(n => n !== data.note);
                    }, data.duration * 1000 - 50);

                    const highlightedKeys = props.piano.current.querySelectorAll(".active");
                    for (let key of highlightedKeys) {
                        const note = playedNotes.find(note => key.classList.contains(formatNote(note, Formats.NORMALIZED_NO_OCTAVE)));
                        if (note) {
                            key.innerHTML = formatNote(note, Formats.MUSICAL_NO_OCTAVE);
                            key.classList.add("fade");
                            setTimeout(() => {
                                key.classList.remove("fade");
                                key.classList.add("fadeout");
                            }, data.duration * 1000 - 500);
                            setTimeout(() => {
                                key.classList.remove("fadeout");
                            }, data.duration * 1000);
                        }
                        if (!note) key.innerHTML = "";
                    }
                }, time * 1000);              
            };

            piano.schedule(context.currentTime, schedule);
        });

    };

    return (
        <img style={{ cursor: "pointer" }} onClick={handleClick} src={`/icons/${props.icon || "piano"}.png`} alt={props.icon || "piano"} />
    );
}