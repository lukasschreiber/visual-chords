import Soundfont from "soundfont-player";

export default function PlayChord(props) {

    const octave = props.octave || 4;

    const possibleTones = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allPossibleTones = [`A${octave-1}`, `B${octave-1}`].concat(...possibleTones.map(tone => `${tone}${octave}`)).concat(...possibleTones.map(tone => `${tone}${octave+1}`)).concat(...possibleTones.map(tone => `${tone}${octave+2}`));

    const getTones = (tones) => {
        const vexFlowTones = [];
        let currentToneIndex = 0;
        for (let tone of allPossibleTones) {
            if (tone.startsWith(tones[currentToneIndex].charAt(0))) {
                tone = tone.replace(tone.charAt(0), tones[currentToneIndex]);
                tone = tone.replaceAll('♯', '#');
                tone = tone.replaceAll('♭', 'b');
                vexFlowTones.push(`${tone}`);
                if (vexFlowTones.length === tones.length) break;
                currentToneIndex++;
            }
        }
        return vexFlowTones;
    };

    const handleClick = (e) => {
        //marimba is great too https://github.com/danigb/soundfont-player
        const context = new AudioContext();
        Soundfont.instrument(context, props.instrument || 'acoustic_grand_piano').then(function (piano) {
            let tones = getTones(props.tones);
            const schedule = [];

            if (props.sequence) {
                schedule.push(...tones.map((tone, i) => {
                    return {
                        time: i,
                        note: tone,
                        duration: 1
                    };
                }));
            }

            if (!props.sequence || (props.sequence && !props.nochord)) {
                let lastTone = Math.max(...schedule.map(n => n.time)) || -1;
                schedule.push(...tones.map(tone => {
                    return {
                        time: lastTone + 1,
                        note: tone,
                        duration: 2
                    };
                }));
            }

            piano.schedule(context.currentTime, schedule);
        });

    };

    return (
        <img style={{ cursor: "pointer" }} onClick={handleClick} src={`/icons/${props.icon || "piano"}.png`} alt={props.icon || "piano"} />
    );
}