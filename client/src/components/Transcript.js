import React, { Component } from 'react';
import './Transcript.css';

class Transcript extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transcriptText: `Speaker 1: Hello there!\nSpeaker 2: Hi! How are you?\nSpeaker 1: I'm doing well, thank you. How about you?\nSpeaker 2: I'm good too. What brings you here today?\nSpeaker 1: I wanted to discuss our upcoming project and get your input on it.\nSpeaker 2: Sure, I'd be happy to help. Let's dive into it.`
    };
  }

  downloadTranscript = () => {
    const transcriptBlob = new Blob([this.state.transcriptText], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(transcriptBlob);
    downloadLink.download = 'transcript.txt';
    downloadLink.click();
  };

  copyTranscriptToClipboard = () => {
    navigator.clipboard.writeText(this.state.transcriptText)
      .then(() => {
        alert('Transcript copied to clipboard!');
      })
      .catch((error) => {
        console.error('Failed to copy transcript: ', error);
      });
  };

  render() {
    const transcriptLines = this.state.transcriptText.split('\n');

    return (
      <div className="transcript-container">
        <h5>Transcript</h5>
        <div className="transcript-text">
          {transcriptLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <div className="button-container">
          <button onClick={this.downloadTranscript}>
            Download Transcript
          </button>
          <button onClick={this.copyTranscriptToClipboard}>
            Copy Transcript
          </button>
        </div>
      </div>
    );
  }
}

export default Transcript;
