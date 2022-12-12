import Soundfont from "soundfont-player";

export default function PlayChord(props) {

    const possibleTones = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allPossibleTrebleTones = ['A3', 'B3'].concat(...possibleTones.map(tone => tone + "4")).concat(...possibleTones.map(tone => tone + "5")).concat(...possibleTones.map(tone => tone + "6"));
    const allPossibleBassTones = ['A2', 'B2'].concat(...possibleTones.map(tone => tone + "3")).concat(...possibleTones.map(tone => tone + "4")).concat(...possibleTones.map(tone => tone + "5"));

    const getTrebleTones = (tones) => {
        const vexFlowTones = [];
        let currentToneIndex = 0;
        for (let tone of allPossibleTrebleTones) {
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

    const getBassTones = (tones) => {
        const vexFlowTones = [];
        let currentToneIndex = 0;
        for (let tone of allPossibleBassTones) {
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
            let tones = props.treble ? getTrebleTones(props.tones) : getBassTones(props.tones);
            const schedule = [];

            if(props.octaveShift) {
                tones = tones.map(tone => {
                    let tonePieces = tone.split("");
                    let octave = Number.parseInt(tonePieces[tonePieces.length-1]);
                    let pitch = tonePieces.slice(0,-1).join("");
                    return `${pitch}${octave+props.octaveShift}`;
                })
            }

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