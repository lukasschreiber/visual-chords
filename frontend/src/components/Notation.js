import { useEffect, useRef } from "react";
import vexflow from "vexflow";

export default function Notation(props) {
    const containerRef = useRef();
    const octave = 4 || props.octave;

    const { Factory, Formatter } = vexflow.Flow;
    const possibleTones = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allPossibleTrebleTones = ['A/3', 'B/3'].concat(...possibleTones.map(tone => tone + "/4")).concat(...possibleTones.map(tone => tone + "/5")).concat(...possibleTones.map(tone => tone + "/6"));
    const allPossibleBassTones = ['A/2', 'B/2'].concat(...possibleTones.map(tone => tone + "/3")).concat(...possibleTones.map(tone => tone + "/4")).concat(...possibleTones.map(tone => tone + "/5"));

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


    useEffect(() => {
        const factory = new Factory({ renderer: { elementId: containerRef.current.id, width: 180, height: 140 } });

        // remove old svg elements
        let children = containerRef.current.querySelectorAll("svg:not(:last-of-type)");
        for (let child of children) {
            containerRef.current.removeChild(child);
        }

        const stave = factory.Stave(0, 0, 180);
        stave.addClef(props.treble ? "treble" : "bass");
        stave.setY(20);

        const voice = factory.Voice({ time: { num_beats: 4, beat_value: 4 } });

        const keys = props.treble ? getTrebleTones(props.tones) : getBassTones(props.tones);
        const keysWithoutModifier = keys.map(key => {
            const keyOctave = key.split("/");
            return `${keyOctave[0].split("")[0]}/${keyOctave[1]}`;
        });

        const note = factory.StaveNote({ keys: keysWithoutModifier, duration: "1", auto_stem: true, clef: props.treble ? "treble" : "bass" });
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].includes("#")) {
                note.addModifier(factory.Accidental({ type: "#" }), i);
            }
            if (keys[i].includes("bb")) {
                note.addModifier(factory.Accidental({ type: "bb" }), i);
            } else if (keys[i].includes("b")) {
                note.addModifier(factory.Accidental({ type: "b" }), i);
            }
            if (keys[i].includes("x")) {
                note.addModifier(factory.Accidental({ type: "##" }), i);
            }
        }

        voice.addTickable(note);
        const formatter = new Formatter();
        formatter.joinVoices([voice]).format([voice], 140);      

        // Render voice
        voice.draw(factory.getContext(), stave);

        factory.draw();

    }, [props.tones]);

    return (
        <div className="notation" ref={containerRef} id={`container-${Math.random() * Math.random() * 300}`}>
        </div>
    );
}