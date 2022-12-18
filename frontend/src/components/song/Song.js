import { useState } from "react";
import "../Chord.css";
import Piano from "../Piano";
import PlaySong from "./PlaySong";
import "./Song.css";

export default function Song(props) {
    const [notes, setNotes] = useState([]);

    return (
        <div className="chord songbox">
            <div className="header">
                <h1>{props.name}</h1>
            </div>
            <Piano from="C2" to="C6" tones={notes} names="highlighted" />
            <PlaySong name="last_christmas" onSchedule={(notes, channel) => {setNotes(state => [...state, {channel, notes}])}}/>
        </div>
    );
}