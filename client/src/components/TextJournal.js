import React, { useState, forwardRef } from 'react';

const TextJournal = forwardRef(({ onSubmit }, ref) => {
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text && title) {
            onSubmit(title, text);
            setText(""); 
            setTitle(""); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className="text-journal-form">
            <textarea
                ref={ref} // Reference for scrolling
                className="entry-title"
                placeholder="Enter your journal title here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                className="entry-text"
                placeholder="Write your journal entry here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button className="add-entry-button" type="submit">Add Entry</button>
        </form>
    );
});

export default TextJournal;
