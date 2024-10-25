import { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth'; 
import { auth } from '../firebase';
import './App.css';

interface TranscriptEntry {
  speaker: string;
  transcript: string;
  type: string; // "partial" or "final"
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(''); 
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);

  // Reference to the end of the transcript list
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom div whenever the transcripts update
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts]);

  // send a start recording message 
  const handleStartRecording = () => {
    setIsRecording(true);
    console.log('Recording started...');
    chrome.runtime.sendMessage({ action: "StartTranscription" });
  };

  // sending a recording stopping message 
  const handleStopRecording = () => {
    setIsRecording(false);
    console.log('Recording stopped.');
    chrome.runtime.sendMessage({ action: "StopTranscription" });
  };

  //sending the meeting data to the main app
  const sendRecordingToMain = () => {
    console.log('sending to main');
    chrome.runtime.sendMessage({ action: "MeetingProcessed" });
  };
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // listening for speaker change, transcript message and the meeting config
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === "ActiveSpeakerChange" && message.active_speaker) {
        setActiveSpeaker(message.active_speaker); // Update the active speaker
      }
      if (message.action === "UpdateTranscript") {
        const transcription = message.transcript.transcription; 
        const type = message.transcript.type; 
        console.log(`The type: ${type}, the message: ${transcription}`);
    
        // Update transcripts state
        setTranscripts((prevTranscripts) => {
            const lastTranscript = prevTranscripts[prevTranscripts.length - 1];
    
            if (type === 'partial') {
                // If the last transcript is partial and from the same speaker, update it
                if (lastTranscript && lastTranscript.speaker === activeSpeaker && lastTranscript.type === 'partial') {
                    return [...prevTranscripts.slice(0, -1), { ...lastTranscript, transcript: transcription }];
                }
    
                // If the last transcript is final, create a new entry
                if (lastTranscript && lastTranscript.speaker === activeSpeaker && lastTranscript.type === 'final') {
                    return [...prevTranscripts, { speaker: activeSpeaker, transcript: transcription, type }];
                }
    
                // If there is no last transcript or it's from a different speaker, add a new entry
                return [...prevTranscripts, { speaker: activeSpeaker, transcript: transcription, type }];
            }
    
            if (type === 'final') {
                // If the last entry is partial from the same speaker, replace it with the new final
                if (lastTranscript && lastTranscript.speaker === activeSpeaker && lastTranscript.type === 'partial') {
                    return [...prevTranscripts.slice(0, -1), { speaker: activeSpeaker, transcript: transcription, type }];
                }
    
                // If the last entry is final, create a new entry
                return [...prevTranscripts, { speaker: activeSpeaker, transcript: transcription, type }];
            }
    
            // fallback, should not happen
            return prevTranscripts;
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [activeSpeaker]);

  return (
    <div className="card">
            <div className="logout-button-container" onClick={handleLogout}>
        <img 
          src="/icons/sign-out.png" 
          alt="Logout Icon" 
          className="logout-button" 
        />
        <div className="logout-tooltip">Logout</div>
      </div>
      <h1>Lifeline Meeting Recorder</h1>
      <div>
      <button onClick={handleStartRecording} disabled={isRecording}>Start Recording</button>
      <button onClick={handleStopRecording} disabled={!isRecording}>Stop Recording</button>
      </div>
      <p>{isRecording ? 'Recording is in progress...' : 'Not recording'}</p>

      {transcripts.length === 0 ? (
        <div className="empty-transcript">
          <img src="/icons/transcription.png" alt="Transcription Icon" className="transcription-icon" />
          <p>Join a meeting and start recording!</p>
          <p>Please refresh the window if the recording doesn't begin.</p>
        </div>
      ) : (
        <div className="transcript-container">
          <div className="transcript-log">
            {transcripts.map((entry, index) => (
              <p key={index}>
                <strong>{entry.speaker}:</strong> {entry.transcript} {entry.type === 'partial' && <i>(speaking...)</i>}
              </p>
            ))}
            {/* Invisible element to scroll to the latest line */}
            <div ref={transcriptEndRef}></div>
          </div>
        </div>
      )}
  
      <button onClick={sendRecordingToMain}>Send Meeting Data to LifeLine</button>

    </div>
  );
  
}

export default App;
