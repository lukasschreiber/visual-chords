import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createEditor, Transforms, Text, Editor, Range } from 'slate';
import ReactDOM from 'react-dom';
import { Slate, Editable, withReact, ReactEditor, useSelected, useFocused } from 'slate-react';

import "./Search.css";

const Regex = {
    comma: /,/g
};

const Leaf = ({ attributes, children, leaf }) => (
    <span className={`${leaf.modus && "modus"} ${leaf.comma && "comma"}`} {...attributes}>
        {children}
    </span>
);


const decorate = ([node, path]) => {
    if (!Text.isText(node)) return [];

    const ranges = [];
    let match = null;

    while ((match = Regex.comma.exec(node.text)) !== null) {
        ranges.push({
            comma: true,
            anchor: { path, offset: match.index },
            focus: { path, offset: match.index + match[0].length },
        });
    }

    return ranges;
};


const withSingleLine = (editor) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = ([node, path]) => {
        if (path.length === 0) {
            if (editor.children.length > 1) {
                Transforms.mergeNodes(editor);
            }
        }

        return normalizeNode([node, path]);
    };

    return editor;
};

export default function Search(props) {
    const ref = useRef();
    const [target, setTarget] = useState();
    const [index, setIndex] = useState(0);
    const [search, setSearch] = useState('');
    const editor = useMemo(() => withModes(withSingleLine(withReact(createEditor()))), []);
    const renderElement = useCallback(props => <Element {...props} />, []);
    const [mode, setMode] = useState("Chord");
    const [debounceTimer, setDebounceTimer] = useState(null);
    const [value, setValue] = useState([
        {
            type: "paragraph",
            children: [{ text: "" }],
        }
    ]);

    const suggestions = SUGGESTIONS.filter(c =>
        c.toLowerCase().startsWith(search.toLowerCase())
    ).slice(0, 10);

    const onKeyDown = useCallback(
        event => {
            if (target && suggestions.length > 0) {
                switch (event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        const prevIndex = index >= suggestions.length - 1 ? 0 : index + 1;
                        setIndex(prevIndex);
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        const nextIndex = index <= 0 ? suggestions.length - 1 : index - 1;
                        setIndex(nextIndex);
                        break;
                    case 'Tab':
                    case 'Enter':
                        event.preventDefault();
                        Transforms.select(editor, target);
                        insertMode(editor, suggestions[index]);
                        setTarget(null);
                        break;
                    case 'Escape':
                        event.preventDefault();
                        setTarget(null);
                        break;
                    default:
                }
            } else {
                // would be better with context, need to know the character before, replace strings etc - this is just temporary
            }

            if (mode.includes("Notes")) {
                // apply rule only in Notes input mode
                switch (event.key) {
                    case ',':
                        event.preventDefault();
                        Transforms.insertText(editor, ", ");
                        break;
                    case 'b':
                        event.preventDefault();
                        Transforms.insertText(editor, "♭");
                        break;
                    case '#':
                        event.preventDefault();
                        Transforms.insertText(editor, "♯");
                        break;
                    default:
                }
            }
        },
        [index, target, mode, editor, suggestions]
    );

    useEffect(() => {
        if (target && suggestions.length > 0) {
            const el = ref.current;
            const domRange = ReactEditor.toDOMRange(editor, target);
            const rect = domRange.getBoundingClientRect();
            el.style.top = `${rect.top + window.pageYOffset + 24}px`;
            el.style.left = `${rect.left + window.pageXOffset}px`;
        }
    }, [suggestions.length, editor, index, search, target]);

    useEffect(() => {
        if (props.chord !== "") {
            Transforms.delete(editor, {
                at: {
                    anchor: Editor.start(editor, []),
                    focus: Editor.end(editor, []),
                },
            });
            setMode("Chord");
            insertMode(editor, "Chord");
            Transforms.insertText(editor, props.chord);
            if(props.onChange) props.onChange({
                mode: "Chord",
                name: props.chord
            });
        }
    }, [props.chord, editor]);


    return (
        <Slate
            editor={editor}
            value={value}
            onChange={(e) => {
                setValue(e);
                let mode = "Chord";
                if (e[0].children.find(c => c.type === "mode")) {
                    setMode(e[0].children.find(c => c.type === "mode").character);
                    mode = e[0].children.find(c => c.type === "mode").character;
                } else {
                    setMode("Chord");
                    mode = "Chord";
                }

                clearTimeout(debounceTimer);
                setDebounceTimer(setTimeout(function () {
                    if (props.onChange) {
                        if (mode.includes("Notes")) {
                            props.onChange({
                                mode,
                                notes: e[0].children.filter(c => c.text && c.text !== "").map(c => c.text).join("").split(",").map(c => c.trim()).filter(c => c !== "")
                            });
                        } else {
                            const name = e[0].children.filter(c => c.text && c.text !== "").map(c => c.text).join("");
                            if (!name.includes("@")) {
                                props.onChange({
                                    mode,
                                    name: e[0].children.filter(c => c.text && c.text !== "").map(c => c.text).join("")
                                });
                            }
                        }
                    }
                }, 200));

                const { selection } = editor;

                if (selection && Range.isCollapsed(selection)) {
                    const [start] = Range.edges(selection);
                    const wordBefore = Editor.before(editor, start, { unit: 'word' });
                    const before = wordBefore && Editor.before(editor, wordBefore);
                    const beforeRange = before && Editor.range(editor, before, start);
                    const beforeText = beforeRange && Editor.string(editor, beforeRange);
                    const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
                    const after = Editor.after(editor, start);
                    const afterRange = Editor.range(editor, start, after);
                    const afterText = Editor.string(editor, afterRange);
                    const afterMatch = afterText.match(/^(\s|$)/);

                    if (beforeMatch && afterMatch) {
                        setTarget(beforeRange);
                        setSearch(beforeMatch[1]);
                        setIndex(0);
                        return;
                    }
                }

                setTarget(null);
            }}
        >
            <Editable
                decorate={decorate}
                renderLeaf={Leaf}
                renderElement={renderElement}
                className="search"
                onKeyDown={onKeyDown}
                placeholder="Enter @Chord to find a chord like C Major or enter @Notes to find a chord by its notes like C, E, G..."
                style={{
                    whiteSpace: "pre"
                }}
            />
            {target && suggestions.length > 0 && (
                <Portal>
                    <div
                        ref={ref}
                        style={{
                            top: '-9999px',
                            left: '-9999px',
                            position: 'absolute',
                            zIndex: 1,
                            padding: '3px',
                            background: 'white',
                            borderRadius: '4px',
                            boxShadow: '0 1px 5px rgba(0,0,0,.2)',
                        }}
                        data-cy="modes-portal"
                    >
                        {suggestions.map((char, i) => (
                            <div
                                key={char}
                                style={{
                                    padding: '1px 3px',
                                    borderRadius: '3px',
                                    background: i === index ? '#B4D5FF' : 'transparent',
                                }}
                            >
                                {char}
                            </div>
                        ))}
                    </div>
                </Portal>
            )}
        </Slate>
    );
}

const withModes = editor => {
    const { isInline, isVoid, markableVoid } = editor;

    editor.isInline = element => {
        return element.type === 'mode' ? true : isInline(element);
    };

    editor.isVoid = element => {
        return element.type === 'mode' ? true : isVoid(element);
    };

    editor.markableVoid = element => {
        return element.type === 'mode' || markableVoid(element);
    };

    return editor;
};

const insertMode = (editor, character) => {
    const mode = {
        type: 'mode',
        character,
        children: [{ text: '' }],
    };
    Transforms.insertNodes(editor, mode);
    Transforms.move(editor);
};

const Element = props => {
    const { attributes, children, element } = props;
    switch (element.type) {
        case 'mode':
            return <Mode {...props} />;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const Mode = ({ attributes, children, element }) => {
    const selected = useSelected();
    const focused = useFocused();
    const style = {
        padding: '5px 5px 4px',
        margin: '0px 1px',
        marginRight: '5px',
        verticalAlign: 'baseline',
        display: 'inline-block',
        borderRadius: '7px',
        backgroundColor: '#ced0d1',
        fontWeight: '600',
        fontSize: '0.9em',
        boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
    };
    // See if our empty text child has any styling marks applied and apply those
    if (element.children[0].bold) {
        style.fontWeight = 'bold';
    }
    if (element.children[0].italic) {
        style.fontStyle = 'italic';
    }
    return (
        <span
            {...attributes}
            contentEditable={false}
            data-cy={`mode-${element.character.replace(' ', '-')}`}
            style={style}
        >
            {children}@{element.character}:
        </span>
    );
};

const Portal = ({ children }) => {
    return typeof document === 'object'
        ? ReactDOM.createPortal(children, document.body)
        : null;
};

const SUGGESTIONS = [
    "Notes",
    "Chord"
];