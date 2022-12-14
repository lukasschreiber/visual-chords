import { getChordDescription } from "../helpers/chords.js";
import "./ChordDescription.css";

export default function Description(props) {

    const description = getChordDescription(props.name, props.keynote);
    return (
        <div>
            {description.keywords.map((keyword, index) => {
                const delimiter = index < description.keywords.length - 1 ? ", " : "";
                description.definitions.forEach(definition => {
                    if (keyword.match(definition.defintionMatcher))
                        keyword = keyword.replace(definition.defintionMatcher, `<u class="tooltip" data-tooltip="${definition.definition}">${keyword.match(definition.defintionMatcher)[0]}</u>`);
                });
                return (
                    <span>
                        <span dangerouslySetInnerHTML={{ __html: keyword }}></span>
                        {delimiter}
                    </span>
                    );
            })}
        </div>
    );
}