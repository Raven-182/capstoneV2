import React, { useState, useRef, useEffect } from 'react';
import '../../App.css';
import '../Journal.css';
import TextJournal from '../TextJournal';
import VoiceJournal from '../VoiceJournal';
import EditTextJournal from '../EditTextJournal';
import { auth, db } from '../../firebaseConfig'; // Make sure to import auth
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function Journal() {
    const user = auth.currentUser; // Get the currently logged-in user
    const [showTextJournal, setShowTextJournal] = useState(false);
    const [showVoiceJournal, setShowVoiceJournal] = useState(false);
    const [journalEntries, setJournalEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [isRecording, setIsRecording] = useState(false); // Track recording s
    const [editEntry, setEditEntry] = useState(null);
    const [showEditTextEntry, setShowEditTextEntry] = useState(false);
    const [editText, setEditText] = useState("");
    const [editTitle, setEditTitle] = useState("");

    const textJournalRef = useRef(null);
    const voiceJournalRef = useRef(null);
    const editTextJournalRef = useRef(null);

    useEffect(() => {
        if (user) {
            const unsubscribe = onSnapshot(collection(db, "users", user.uid, "journalEntries"), (snapshot) => {
                const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setJournalEntries(entries);
            });

            return () => unsubscribe();
        }
    }, [user]); // Fetch data when user changes

    const handleTextSubmit = async (title, text) => {
        const dateTime = new Date().toLocaleString();
        await addDoc(collection(db, "users", user.uid, "journalEntries"), {
            title: title,
            type: 'text',
            content: text,
            dateTime: dateTime
        });
        setShowTextJournal(false);
        // Scroll to the journal entries
        setTimeout(() => {
            if (textJournalRef.current) {
                textJournalRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleCancelVoice = () => {
        setShowVoiceJournal(false);
        setIsRecording(false);
    };

    const handleVoiceSubmit = async (audioUrl, title) => {
        const dateTime = new Date().toLocaleString();
        await addDoc(collection(db, "users", user.uid, "journalEntries"), {
            title: title,
            type: 'audio',
            content: audioUrl,
            dateTime: dateTime
        });
        setShowVoiceJournal(false);
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, "users", user.uid, "journalEntries", id));
    };

    const handleEdit = (id) => {
        const entry = journalEntries.find(entry => entry.id === id);
        if (entry) {
            setEditText(entry.content);
            setEditTitle(entry.title);
            setEditEntry(entry);
            setShowEditTextEntry(true);
            setTimeout(() => {
                if (editTextJournalRef.current) {
                    editTextJournalRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100); // Scroll to edit form
        }
    };

    const handleEditTextSubmit = async (title, text) => {
        await updateDoc(doc(db, "users", user.uid, "journalEntries", editEntry.id), {
            title: title,
            content: text
        });
        setShowEditTextEntry(false);
    };

    const filteredEntries = journalEntries.filter((entry) => {
        if (filter === 'all') return true;
        return entry.type === filter;
    }).filter(entry => entry.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="journal-page">
            <div className="journal-container">
                <div className="journal-left">
                    <div className="filter-buttons">
                        <button onClick={() => setFilter('all')}>All</button>
                        <button onClick={() => setFilter('text')}>Text</button>
                        <button onClick={() => setFilter('audio')}>Voice</button>
                    </div>

                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-bar"
                    />

                    <div className="journal-entries" ref={textJournalRef}>
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
                                                <>
                                                    <button className="entry_edit" onClick={() => handleEdit(entry.id)}>
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>

                                                    <a 
                                                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(entry.content)}`} 
                                                        download={`${entry.title}.txt`}
                                                    >
                                                        <button className="entry_download">
                                                            <i className="fa-solid fa-download"></i>
                                                        </button>
                                                    </a>
                                                </>
                                            )}

                                            {entry.type === "audio" && (
                                                <>
                                                    <audio controls className="entry-audio-left">
                                                        <source src={entry.content} type="audio/mpeg" />
                                                        Your browser does not support the audio tag.
                                                    </audio>

                                                    <a href={entry.content} download={`${entry.title}.mp3`}>
                                                        <button className="entry_download">
                                                            <i className="fa-solid fa-download"></i>
                                                        </button>
                                                    </a>
                                                </>
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
                    <h1 className="journal-text1"><i className="fa-solid fa-book-open"></i> My Journal</h1>
                    <p className="journal-text2">Journal of Thoughts & Ideas.</p>
                    <p className="journal-text3">Share Your Journey: Text or Voice Entries</p>
                    <div className="journal-buttons">
                        <button className="circular-button text-button" onClick={() => {
                            setShowTextJournal(true);
                            setShowVoiceJournal(false); // Close voice journal when opening text journal
                            setTimeout(() => {
                                if (textJournalRef.current) {
                                    textJournalRef.current.scrollIntoView({ behavior: 'smooth' });
                                }
                            }, 100);
                        }}>
                            <i className="fas fa-book" style={{ fontSize: '30px' }}></i>
                        </button>

                        <button className="circular-button voice-button" onClick={() => {
                            setShowVoiceJournal(true);
                            setShowTextJournal(false); // Close text journal when opening voice journal
                            setTimeout(() => {
                                if (voiceJournalRef.current) {
                                    voiceJournalRef.current.scrollIntoView({ behavior: 'smooth' });
                                }
                            }, 100); // Adjust the delay if necessary
                        }}>
                             <i className={`fas fa-microphone ${isRecording ? 'bounce' : ''}`} style={{ fontSize: '30px' }}></i>
                        </button>
                    </div>

                    {showTextJournal && (
                        <>
                            <TextJournal ref={textJournalRef} onSubmit={handleTextSubmit} />
                            <button className="cancel-button" onClick={() => setShowTextJournal(false)}>
                                Cancel
                            </button>
                        </>
                    )}

                    {showEditTextEntry && (
                        <>
                            <EditTextJournal
                                ref={editTextJournalRef}
                                editText={editText}
                                editTitle={editTitle}
                                onSubmit={handleEditTextSubmit}
                            />
                            <button className="cancel-button" onClick={() => setShowEditTextEntry(false)}>
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
