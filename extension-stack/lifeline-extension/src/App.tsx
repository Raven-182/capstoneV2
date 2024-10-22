/*global chrome*/
import { useState } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);

  // Function to handle sending a message when start recording is clicked
  const handleStartRecording = () => {
    setIsRecording(true);
    console.log('Recording started...');

    // Send a message to the background script or other parts of the extension
    chrome.runtime.sendMessage({ action: "StartTranscription" });
  };

  // Function to handle sending a message when stop recording is clicked
  const handleStopRecording = () => {
    setIsRecording(false);
    console.log('Recording stopped.');
    chrome.runtime.sendMessage({ action: "StopTranscription" });

  };

  return (
    <div className="card">
      <h1>Lifeline Meeting Assistant</h1>

      <div>
        <button onClick={handleStartRecording}>Start Recording</button>
        <button onClick={handleStopRecording}>Stop Recording</button>
      </div>

      {/* Optionally, you can show status */}
      <p>{isRecording ? 'Recording is in progress...' : 'Not recording'}</p>
    </div>
  );
}

export default App;
