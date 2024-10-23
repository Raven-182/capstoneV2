/* Global variables */
let audioProcessor = undefined;
let recorder = undefined;
let samplingRate = 8000;
let audioContext;
let displayStream;
let micStream;
let isRecording = false;
let socket;
let micGainNode; // to control the mute state 
const gladiaUrl = "wss://api.gladia.io/audio/text/audio-transcription";
async function initializeGladiaProcessing() {
    const configMessage = {
        x_gladia_key: "", 
        frames_format: 'bytes',
        language_behaviour: "automatic single language",
        sample_rate: samplingRate,
        encoding: "WAV/PCM",
        model_type: "fast",
    };
    // Connect to the API WebSocket
    socket = new WebSocket(gladiaUrl);
    socket.onopen = () => {
        console.log('WebSocket connection established with Gladia');
  
        socket.send(JSON.stringify(configMessage));
    };
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message);
        if (message?.event === 'transcript' && message.transcription) {
          const transcript = message;
          if (message.type === 'final') {
            console.log(`Transcription: ${transcript.transcription}`);
            chrome.runtime.sendMessage({ action: "UpdateTranscript", transcript});
          }
          else{
            chrome.runtime.sendMessage({ action: "UpdateTranscript", transcript});
          }
        }
    };
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    socket.onclose = (event) => {
        console.log('WebSocket connection closed', event);
    };
}
// Listen for start and end recording messages 
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.action === "StartTranscription" && !isRecording) {
    initializeGladiaProcessing();
    console.log("Received start transcription request", request);
    startRecording();
    isRecording = true; // Set the flag toensure noxw re-triggering
  } else if (request.action === "StopTranscription" && isRecording) {
    console.log("Received stop transcription request", request);
    stopRecording();
    isRecording = false; // Reset the flag
  }
  else if (request.action === "MuteChange" && micGainNode != null) {
    // Mute or unmute the microphone
    if (request.mute) {
      console.log("Muting microphone...");
      micGainNode.gain.setValueAtTime(0, audioContext.currentTime); // Set volume to 0
    } else {
      console.log("Unmuting microphone...");
      micGainNode.gain.setValueAtTime(1, audioContext.currentTime); // Restore volume to 1
    }
  }
});

const mergeBuffers = (input) =>{
  const recLength = recBuffers.length;
  var result = new Float32Array(recLength * 128); //Resulting array with all chunks 
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++) {
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

let audioBuffer = []; // Buffer for 1 second of audio
// Helper function to send audio data every second
function startSendingAudio() {
  setInterval(async () => {
    if (audioBuffer.length > 0) {
      let sendingBuffer = audioBuffer;
      audioBuffer = []; // Create a new buffer for the next second of data
      console.log("sending buffer", sendingBuffer);
      // Concatenate and send the accumulated ArrayBuffers
       let combinedBuffer = mergeBuffers(audioBuffer);
      try {
        // Send the combined buffer to the API
        let payload = { action: "AudioData", audio: combinedBuffer };
        chrome.runtime.sendMessage(payload);
      } catch (error) {
        console.error("Error sending audio data:", error);
      }
    }
  }, 1000); // Send every 1 second
}

// Stero audio into a single mono chsnnel
const mergeToMono = (audioSource) => {
  const splitter = audioContext.createChannelSplitter(2);
  const merger = audioContext.createChannelMerger(1);
  audioSource.connect(splitter);
  splitter.connect(merger, 0, 0);
  splitter.connect(merger, 1, 0);
  return merger;
};
  
// Function to stop audio streaming and clean up resources
const stopRecording = async () => {
  console.log("Stopping streaming");
  // If there's an active audio processor, send a message to stop recording
  if (audioProcessor && audioProcessor.port) {
    audioProcessor.port.postMessage({
      message: "UPDATE_RECORDING_STATE",
      setRecording: false,
    });
    // Close the AudioWorklet port and disconnect the processor
    audioProcessor.port.close();
    audioProcessor.disconnect();
    audioProcessor = null;

    // Stop all tracks from the display and mic stream
    displayStream.getTracks().forEach((track) => {
      track.stop();
    });

    micStream.getTracks().forEach((track) => {
      track.stop();
    });

    // If the AudioContext is active, close it and notify that transcription has stopped
    if (audioContext) {
      audioContext.close().then(() => {
        chrome.runtime.sendMessage({ action: "TranscriptionStopped" });
        console.log("AudioContext closed.");
        audioContext = null;
      });
    }
  }
};
// Function to start the streaming and initialize audio processing
const startRecording = async () => {
  console.log("Starting recording");
  try {
    audioContext = new window.AudioContext({
      //audio samples captured per second
      sampleRate: samplingRate,
    });

    displayStream = await navigator.mediaDevices.getDisplayMedia({
      preferCurrentTab: true, // Prefer capturing the current tab
      video: true,            // Capture video to check for speaker changes 
      audio: {
        noiseSuppression: true,  // Control background noise
        echoCancellation: true,  // Cancel echoing audio
      },
    });  // rejected with an error if user denies

     // Stop streaming if the display sharing ends(someone clicks stop sharing)
    displayStream.getAudioTracks()[0].onended = () => {
      stopRecording();
    };
    // Capture the microphone (no video here)
    micStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
      },
    });


    // Incoming audio stream
    let displayAudioSource =
      audioContext.createMediaStreamSource(displayStream);
    // Outgoing audio stream 
    let micAudioSource = audioContext.createMediaStreamSource(micStream);
     // Create a GainNode to control the volume of the microphone audio
     micGainNode = audioContext.createGain();
     micGainNode.gain.setValueAtTime(1, audioContext.currentTime); // Start with volume at 1
 
    // Convert stereo audio to mono for both sources
    let monoDisplaySource = mergeToMono(displayAudioSource);
    let monoMicSource = mergeToMono(micAudioSource);

     // Connect the mic source to the gain node
     monoMicSource.connect(micGainNode);

    // Combine multiple audio streams to one output with two channels
    let channelMerger = audioContext.createChannelMerger(2);
  
    // monoMicSource.connect(channelMerger, 0, 0);
    micGainNode.connect(channelMerger, 0, 0);
    monoDisplaySource.connect(channelMerger, 0, 1);
    
    // Load the AudioWorklet module for custom audio processing
    try {
      await audioContext.audioWorklet.addModule("audio-worklet.js");
    } catch (error) {
      console.log(`Error adding module: ${error}`);
    }
    //runs on audio rendering thread,separate, real-time threadfor audio processing.
    audioProcessor = new AudioWorkletNode(audioContext, "recording-processor");
    audioProcessor.port.onmessageerror = (error) => {
      console.log(`Error receiving message from worklet: ${error}`);
    };
    //connect channel merger node to the worklet node
    channelMerger.connect(audioProcessor);

    // Process audio data received from the AudioWorklet and send it to background 
    audioProcessor.port.onmessage = async (event) => {
      let buffer = event.data;
      socket.send(buffer);
      // let payload = { action: "AudioData", audio: buffer };
      // chrome.runtime.sendMessage(payload);
    };

  } catch (error) {
    console.log("Error in streaming process", error);
    await stopRecording(); // Clean up if there’s any error during recording
  }
};