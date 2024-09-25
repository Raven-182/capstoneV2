import React, { useState, forwardRef } from 'react';

const TextJournal = forwardRef(({ editText, editTitle, onSubmit }, ref) => {
    const [title, setTitle] = useState(editTitle);
    const [text, setText] = useState(editText);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(title, text);
    };

    return (
        <form onSubmit={handleSubmit} className="text-journal-form">
            <input
                ref={ref} // Reference for scrolling
                type="text"
                className="entry-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Edit title"
            />
            <textarea
                value={text}
                className="entry-text"
                onChange={(e) => setText(e.target.value)}
                placeholder="Edit text"
            />
            <button className="add-entry-button" type="submit">Update Entry</button>
        </form>
    );
});

export default TextJournal; // Corrected export
