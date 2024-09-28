let transcriptionStarted = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if ((message.action === 'StartTranscription' && !transcriptionStarted) || message.action === 'StopTranscription') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
  
      if (message.action === 'StartTranscription') {
        transcriptionStarted = true; // Set flag to prevent double-start
      } else if (message.action === 'StopTranscription') {
        transcriptionStarted = false; // Reset flag when stopped
      }
    }
  });
  
let audioData;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "AudioData") {
        audioData = message.audio;
         console.log("Audio data stored in background:", audioData);
    }
});


   // Send the audio data to the popup.html


