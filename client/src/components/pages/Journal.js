import React, { useState, useRef } from 'react';
import '../../App.css';
import '../Journal.css';
import TextJournal from '../TextJournal';
import VoiceJournal from '../VoiceJournal';
import EditTextJournal from '../EditTextJournal';


export default function Journal() {
    const [showTextJournal, setShowTextJournal] = useState(false);
    const [showVoiceJournal, setShowVoiceJournal] = useState(false);
    const [journalEntries, setJournalEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [isRecording, setIsRecording] = useState(false); // Track recording state

    const [editEntry, setEditEntry] = useState(null);
    const [showEditTextEntry, setShowEditTextEntry] = useState(false);
    const [editText, setEditText] = useState("");
    const [editTitle, setEditTitle] = useState("");

    // Create refs for text and voice journal areas
    const textJournalRef = useRef(null);
    const voiceJournalRef = useRef(null);
    const editTextJournalRef = useRef(null);

    const handleTextSubmit = (title, text) => {
        const dateTime = new Date().toLocaleString();
        setJournalEntries([...journalEntries, {
            id: Date.now(),
            title: title,
            type: 'text',
            content: text,
            dateTime
        }]);
        setShowTextJournal(false);
    };

    const handleVoiceSubmit = (audioUrl, title) => {
        const dateTime = new Date().toLocaleString();
        setJournalEntries([...journalEntries, {
            id: Date.now(),
            type: 'audio',
            title: title,
            content: audioUrl,
            dateTime
        }]);
        setShowVoiceJournal(false);
    };

    const handleDelete = (id) => {
        setJournalEntries(journalEntries.filter(entry => entry.id !== id));
    };

    const handleEdit = (id) => {
        const entry = journalEntries.find(entry => entry.id === id); // Find the entry
        if (entry) {
            setEditText(entry.content); // Set the text content
            setEditTitle(entry.title);  // Set the title
            setEditEntry(entry);        // Set the whole entry (if needed for other purposes)
            setShowEditTextEntry(true); // Show the edit form
        }
        setTimeout(() => {
            if (editTextJournalRef.current) {
                editTextJournalRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100); // Scroll after component has mounted
    };
    

    const handleCancelVoice = () => {
        setShowVoiceJournal(false);
        setIsRecording(false);
    };
    const handleCancelText = () => setShowTextJournal(false);

    const handleCancelEditText = () => setShowEditTextEntry(false);

    const handleEditTextSubmit = (title, text) => {
        setJournalEntries(journalEntries.map(entry => 
            entry.id === editEntry.id ? { ...entry, title, content: text } : entry
        ));
        setShowEditTextEntry(false); // Hide the edit form
    };    

    const newTextJournal = () => {
        if (showVoiceJournal) setShowVoiceJournal(false);
        setShowTextJournal(true);
        setTimeout(() => {
            if (textJournalRef.current) {
                textJournalRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100); // Scroll after component has mounted
    };
    
    const newVoiceJournal = () => {
        if (showTextJournal) setShowTextJournal(false);
        setShowVoiceJournal(true);
        setTimeout(() => {
            if (voiceJournalRef.current) {
                voiceJournalRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100); // Scroll after component has mounted
    };
    

    const handleFilterChange = (type) => setFilter(type);

    const filteredEntries = journalEntries.filter((entry) => {
        if (filter === 'all') return true;
        return entry.type === filter;
    }).filter(entry => entry.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="journal-page">
            <div className="journal-container">
                <div className="journal-left">
                    <div className="filter-buttons">
                        <button onClick={() => handleFilterChange('all')}>All</button>
                        <button onClick={() => handleFilterChange('text')}>Text</button>
                        <button onClick={() => handleFilterChange('audio')}>Voice</button>
                    </div>

                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-bar"
                    />

                    <div className="journal-entries">
                        {filteredEntries.length === 0 ? (
                            <p className="no-entries-message">No journal entries</p>
                        ) : (
                            filteredEntries.map(entry => (
                                <div key={entry.id} className="journal-entry">
                                    <div className="entry-content">
                                        <p>{entry.title}</p>
                                    </div>
                                    <div className="entry-info">
                                        <p className="entry-datetime">{entry.dateTime}</p>

                                        <div>
                                            {entry.type === "text" && (
                                                <button className="entry_edit" onClick={() => handleEdit(entry.id)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                            )}

                                            {entry.type === "audio" && (
                                                <audio controls className="entry-audio-left">
                                                    <source src={entry.content} type="audio/mpeg" />
                                                    Your browser does not support the audio tag.
                                                </audio>
                                            )}

                                            &nbsp;&nbsp;&nbsp;&nbsp;

                                            <button className="entry_delete" onClick={() => handleDelete(entry.id)}>
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>

                <div className="journal-right">
                    <h1 className="journal-text1">
                        <i className="fa-solid fa-book-open"></i> My Journal
                    </h1>
                    <p className="journal-text2">Journal of Thoughts & Ideas.</p>
                    <p className="journal-text3">Share Your Journey: Text or Voice Entries</p>
                    <div className="journal-buttons">
                        <button
                            className="circular-button text-button" 
                            onClick={() => newTextJournal()}
                        >
                            <i className="fas fa-book" style={{ fontSize: '30px' }}></i>
                        </button>

                        <button
                            className="circular-button voice-button"
                            onClick={() => newVoiceJournal()}
                        >
                            <i className={`fas fa-microphone ${isRecording ? 'bounce' : ''}`} style={{ fontSize: '30px' }}></i>
                        </button>
                    </div>

                    {showTextJournal && (
                        <>
                        <TextJournal ref={textJournalRef} onSubmit={handleTextSubmit} />
                            <button className="cancel-button" onClick={handleCancelText}>
                                Cancel
                            </button>
                        </>
                    )}

                    {showEditTextEntry && (
                        <>
                                <EditTextJournal
                                    ref={editTextJournalRef}
                                    editText={editText} // Pass editText as prop
                                    editTitle={editTitle} // Pass editTitle as prop
                                    onSubmit={handleEditTextSubmit} // Handle form submission
                                />
                            <button className="cancel-button" onClick={handleCancelEditText}>
                                Cancel
                            </button>
                        </>
                    )}

                    {showVoiceJournal && (
                        <>
                            <div ref={voiceJournalRef}>
                                <VoiceJournal 
                                    onSubmit={handleVoiceSubmit}
                                    onRecordingStart={() => setIsRecording(true)} 
                                    onRecordingStop={() => setIsRecording(false)}
                                />
                            </div>
                            <button className="cancel-button cancel-reco" onClick={handleCancelVoice}>
                                Cancel Recording
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
