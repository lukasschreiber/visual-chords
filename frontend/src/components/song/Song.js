import { useRef } from "react";
import "../Chord.css";
import Piano from "../Piano";
import PlaySong from "./PlaySong";
import "./Song.css";

export default function Song(props) {
    const piano = useRef();

    return (
        <div className="chord songbox">
            <div className="header">
                <h1>{props.name}</h1>
            </div>
            <Piano from="A2" to="C6" reference={piano} names="highlighted" />
            <PlaySong name="adeste_fidelis"/>
        </div>
    );
}