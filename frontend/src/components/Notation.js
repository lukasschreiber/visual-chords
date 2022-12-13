import { useEffect, useRef } from "react";
import vexflow from "vexflow";
import { formatNote, Formats } from "../helpers/formatters.js";

export default function Notation(props) {
    const containerRef = useRef();
    const octave = props.octave || 4;

    const { Factory, Formatter } = vexflow.Flow;
    const possibleTones = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const allPossibleTones = [`A/${octave-1}`, `B/${octave-1}`].concat(...possibleTones.map(tone => `${tone}/${octave}`)).concat(...possibleTones.map(tone => `${tone}/${octave+1}`)).concat(...possibleTones.map(tone => `${tone}/${octave+2}`));

    const getTones = (tones) => {
        const vexFlowTones = [];
        let currentToneIndex = 0;
        for (let tone of allPossibleTones) {
            if (tone.startsWith(tones[currentToneIndex].charAt(0))) {
                tone = formatNote(tone.replace(tone.charAt(0), tones[currentToneIndex]), Formats.STANDARD);
                vexFlowTones.push(`${tone}`);
                if (vexFlowTones.length === tones.length) break;
                currentToneIndex++;
            }
        }
        return vexFlowTones;
    };

    useEffect(() => {
        const factory = new Factory({ renderer: { elementId: containerRef.current.id, width: 180, height: 150 } });

        // remove old svg elements
        let children = containerRef.current.querySelectorAll("svg:not(:last-of-type)");
        for (let child of children) {
            containerRef.current.removeChild(child);
        }

        const clef = octave >= 4 ? "treble" : "bass";

        const stave = factory.Stave(0, 0, 180);
        stave.addClef(clef);
        stave.setY(30);

        const voice = factory.Voice({ time: { num_beats: 4, beat_value: 4 } });

        const keys = getTones(props.tones);
        const keysWithoutModifier = keys.map(key => {
            const keyOctave = key.split("/");
            return `${keyOctave[0].split("")[0]}/${keyOctave[1]}`;
        });

        const note = factory.StaveNote({ keys: keysWithoutModifier, duration: "1", auto_stem: true, clef: clef });
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