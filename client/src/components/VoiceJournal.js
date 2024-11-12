import React, { useState, useRef } from 'react';

const VoiceJournal = ({ onSubmit, onRecordingStart, onRecordingStop }) => {
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [title, setTitle] = useState("");
    const mediaRecorderRef = useRef(null);
    const [audioFile, setAudioFile] = useState(null);

    const startRecording = () => {
        if (title) {
            setRecording(true);
            onRecordingStart(); // Notify parent that recording has started
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = (e) => {
                        const audioBlob = new Blob([e.data], { type: 'audio/mpeg' });
                        const url = URL.createObjectURL(audioBlob);
                        setAudioUrl(url);
                        setAudioFile(audioBlob); // Save the audio file for uploading
                    };
                    mediaRecorderRef.current.start();
                })
                .catch((error) => {
                    console.error("Error accessing microphone:", error);
                });
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
        onRecordingStop(); // Notify parent that recording has stopped
    };

    const handleSave = async () => {
        if (audioFile && title) {
            // Convert audioFile (blob) to base64
            const reader = new FileReader();
            
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1]; // Extract base64 content
    
    
                setTitle("");
                setAudioUrl(null);
                setAudioFile(null); // Reset the file after saving
                onSubmit(base64Audio, title); // Notify parent about the submission
            };
    
            reader.readAsDataURL(audioFile); // Convert blob to base64
        }
    };
    

    return (
        <div>
            {!audioUrl && (
                !recording ? (
                    <>
                        <form>
                            <textarea
                                className="entry-title"
                                placeholder="Enter your journal title here..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </form>
                        <button className="start-reco" onClick={startRecording}>Start Recording</button>
                    </>
                ) : (
                    <button className="stop-reco" onClick={stopRecording}>Stop Recording</button>
                )
            )}

            {audioUrl && (
                <div>
                    <audio className="audio-player" controls>
                        <source src={audioUrl} type="audio/mpeg" />
                    </audio>
                    <button className="save-reco" onClick={handleSave}>Save Entry</button>
                </div>
            )}
        </div>
    );
};

export default VoiceJournal;
