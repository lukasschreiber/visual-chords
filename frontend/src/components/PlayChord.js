import { formatNote, Formats } from "../helpers/formatters.js";
import { Player } from "./song/midi/player.js";

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
        const context = new AudioContext();
        const tones = getTones(props.tones);
        Player.instrument(context, props.instrument || 'acoustic_grand_piano', {notes: tones}).then(instrument => {
            const schedule = [];
            const start = context.currentTime;

            if (props.sequence) {
                schedule.push(...tones.map((tone, i) => {
                    return {
                        time: start + i,
                        note: tone,
                        duration: 1
                    };
                }));
            }

            if (!props.sequence || (props.sequence && !props.nochord)) {
                let lastTone = Math.max(...schedule.map(n => n.time)) !== -Infinity ? Math.max(...schedule.map(n => n.time)) : start - 1;
                schedule.push(...tones.map(tone => {
                    return {
                        time: lastTone + 1,
                        note: tone,
                        duration: 2
                    };
                }));
            }

            instrument.schedule(schedule)
        });

    };

    return (
        <img style={{ cursor: "pointer" }} onClick={handleClick} src={`/icons/${props.icon || "piano"}.png`} alt={props.icon || "piano"} />
    );
}