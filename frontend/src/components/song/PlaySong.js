import parseMIDI from "./midi/parser";
import { Player } from "./midi/player";
import songs from "./midi/songs.json";
import { useState, useEffect, useMemo } from "react";

export default function PlaySong(props) {
    const song = props.name ? songs[props.name] : null;
    const context = useMemo(() => new AudioContext(), []);
    const score = useMemo(() => parseMIDI(song.midi), [song.midi]);
    const [instruments, setInstruments] = useState();

    const handleScheduling = (notes, channel) => {
        if(props.onSchedule) props.onSchedule(notes, channel)
    }

    useEffect(() => {
        let active = true;
        loadInstrument();
        return () => { active = false; };

        async function loadInstrument() {
            setInstruments(null); // this is optional
            const instrumentsInScore = song.voices;
            const loadInstruments = [];
            const instrumentChannels = [];
            for (let instrument of instrumentsInScore) {
                const notes = Array.from(new Set(score.tracks.filter(track => track.header.channel === instrument.channel).flatMap(track => track.events.map(event => event.note))));
                // removed notes
                loadInstruments.push(Player.instrument(context, instrument.instrument, { gain: instrument.gain || 1, onScheduled: (notes)=>handleScheduling(notes, instrument.channel) })); // {notes: ["C4", "Eb4", "G4"]}
                instrumentChannels.push(instrument.channel);
            }
            if (!active) { return; }
            setInstruments(await Promise.all(loadInstruments).then(instruments => instruments.map((instrument, index) => {
                return {
                    instrument,
                    channel: instrumentChannels[index]
                };
            })));
        }
    }, [context, song, score]);

    const handleClick = async (e) => {
        if (!song) return;

        const timePerTick = score.header.tempo[0].secondsPerTick;
        const globalStartTime = context.currentTime;
        // score.tracks = score.tracks.filter((_, index) => index === 1)
        for (let track of score.tracks) {
            const instrument = instruments.find(instrument => instrument.channel === track.header.channel).instrument;
            const schedule = [];

            for (let note of track.events) {
                const tone = {
                    time: globalStartTime + note.time.start * timePerTick,
                    duration: note.time.delta * timePerTick,
                    note: note.note,
                    velocity: note.velocity
                };
                schedule.push(tone);
            }

            instrument.schedule(schedule);
        }

    };

    return (
        <>
            {instruments ? <img style={{ cursor: "pointer", height: "50px" }} onClick={handleClick} src={`/icons/${props.icon || "piano"}.png`} alt={props.icon || "piano"} /> : "Loading..."}
        </>
    );
}