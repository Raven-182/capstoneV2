
/*global chrome*/
import { useState, useEffect } from 'react';
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

  // listening for speaker change and transcript messages
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
      <h1>Lifeline Meeting Assistant</h1>
      <div>
        <button onClick={handleStartRecording}>Start Recording</button>
        <button onClick={handleStopRecording}>Stop Recording</button>
      </div>
      <p>{isRecording ? 'Recording is in progress...' : 'Not recording'}</p>
      <div className="transcript-log">
        {transcripts.map((entry, index) => (
          <p key={index}>
            <strong>{entry.speaker}:</strong> {entry.transcript} {entry.type == 'partial' && <i>(speaking...)</i>}
          </p>
        ))}
      </div>
    </div>
  );
}
export default App;
