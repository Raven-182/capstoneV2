import React from 'react';
import './Transcript.css';

const Transcript = ({ transcript }) => {

  const downloadTranscript = () => {
    const transcriptText = transcript.map(line => `${line.speaker}: ${line.transcript}`).join('\n');
    const transcriptBlob = new Blob([transcriptText], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(transcriptBlob);
    downloadLink.download = 'transcript.txt';
    downloadLink.click();
  };

  const copyTranscriptToClipboard = () => {
    const transcriptText = transcript.map(line => `${line.speaker}: ${line.transcript}`).join('\n');
    navigator.clipboard.writeText(transcriptText)
      .then(() => {
        alert('Transcript copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy transcript: ', error);
      });
  };

  return (
    <div className="transcript-container">
      <h5>Transcript</h5>
      <div className="transcript-text">
        {transcript.map((line, index) => (
          <p key={index}><strong>{line.speaker}:</strong> {line.transcript}</p>
        ))}
      </div>
      <div className="button-container">
        <button onClick={downloadTranscript}>
          Download Transcript
        </button>
        <button onClick={copyTranscriptToClipboard}>
          Copy Transcript
        </button>
      </div>
    </div>
  );
};

export default Transcript;
