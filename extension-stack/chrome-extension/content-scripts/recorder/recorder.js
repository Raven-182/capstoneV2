// // file for the recorder UI functionality
// chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
//     if (request.action === "StartTranscription") {
//       console.log("Received start transcription request", request);
//       initiateStreaming();
//     } else if (request.action === "StopTranscription") {
//       console.log("Received stop transcription request", request);
//       terminateStreaming();
//     }
//   });
  /* Global variables */
  let audioProcessor = undefined;
  let samplingRate = 8000;
  let audioContext;
  let displayStream;
  let micStream;
let isRecording = false;
let audioChunks = [];
let audioLinks = [];

let socket;

const gladiaUrl = "wss://api.gladia.io/audio/text/audio-transcription";

async function initializeGladiaProcessing() {
    const configMessage = {
        x_gladia_key: "", 
        language_behaviour: "automatic single language",
        sample_rate: samplingRate,
    };
    // Connect to the API WebSocket
    socket = new WebSocket(gladiaUrl);

    socket.onopen = () => {
        console.log('WebSocket connection established with Gladia');
  
        socket.send(JSON.stringify(configMessage));
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.transcription) {
            console.log(`Transcription: ${message.transcription}`);
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.action === "StartTranscription" && !isRecording) {
    // initialize the WebSocket
    console.log("Sampling rate before gladia", samplingRate)
    initializeGladiaProcessing();
    console.log("Received start transcription request", request);
    initiateStreaming();
    isRecording = true; // Set the flag to prevent re-triggering
  } else if (request.action === "StopTranscription" && isRecording) {
    console.log("Received stop transcription request", request);
    terminateStreaming();
    logAudioDownloadLink(); 
    isRecording = false; // Reset the flag
  }
});


const logAudioDownloadLink = () => {
  const wavBlob = new Blob(audioChunks, { type: 'audio/wav' });
    
   // Create a FileReader to read the Blob as data URL (base64)
   const reader = new FileReader();
   chrome.runtime.sendMessage({
    action: "AudioProcessed",
    audio: wavBlob // Send base64-encoded audio to popup.js
    }); 
   reader.onloadend = () => {
       const base64AudioData = reader.result; // This is the base64-encoded WAV file
       console.log(base64AudioData)
   };
 
   reader.readAsDataURL(wavBlob);
    // Clear audioChunks for the next recording
    audioChunks = [];
};
  
  

  
  /* Helper functions */
  //cobverts to an octet stream data 
  const convertBytesToBase64DataUrl = async (bytes, type = "application/octet-stream") => {
    return await new Promise((resolve, reject) => {
      const reader = Object.assign(new FileReader(), {
        onload: () => resolve(reader.result),
        onerror: () => reject(reader.error),
      });
      //convert binary bytes into a Base64 Data URL
      reader.readAsDataURL(new File([bytes], "", { type }));
    });
  }

  const pcmEncode = (input) => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i += 1) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  //stero audio into a single mono chsnnel
  const mergeToMono = (audioSource) => {
    const splitter = audioContext.createChannelSplitter(2);
    const merger = audioContext.createChannelMerger(1);
    audioSource.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 0);
    return merger;
  };
  
  const terminateStreaming = async () => {
    console.log("Stopping streaming");
    if (audioProcessor && audioProcessor.port) {
      audioProcessor.port.postMessage({
        message: 'UPDATE_RECORDING_STATE',
        setRecording: false,
      });
      audioProcessor.port.close();
      audioProcessor.disconnect();
      audioProcessor = null;
  
      displayStream.getTracks().forEach((track) => {
        track.stop();
      });
  
      micStream.getTracks().forEach((track) => {
        track.stop();
      });
  
      if (audioContext) {
        audioContext.close().then(() => {
          chrome.runtime.sendMessage({ action: "TranscriptionStopped" });
          console.log('AudioContext closed.');
          audioContext = null;
        });
      }
    }
  }
  
  const initiateStreaming = async () => {
    console.log("Starting recording")
    try {
        //audio samples captured per second 
      audioContext = new window.AudioContext({
        sampleRate: 8000
      });
  
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true,
        video: true,
        audio: {
          noiseSuppression: true,
          autoGainControl: true,
          echoCancellation: true,
        }
      });
  

      //ends here as well if you stop share
      displayStream.getAudioTracks()[0].onended = () => {
        terminateStreaming();
      };
  
      micStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          noiseSuppression: true,
          autoGainControl: true,
          echoCancellation: true,
        }
      });
  
      samplingRate = audioContext.sampleRate;
      console.log("Sending sampling rate:", samplingRate);
      chrome.runtime.sendMessage({ action: "SamplingRate", samplingRate: samplingRate });
      //output
      let displayAudioSource = audioContext.createMediaStreamSource(displayStream);
      //input
      let micAudioSource = audioContext.createMediaStreamSource(micStream);
    
      let monoDisplaySource = mergeToMono(displayAudioSource);
      let monoMicSource = mergeToMono(micAudioSource);
    //a channel for display and a channel for mic
      let channelMerger = audioContext.createChannelMerger(2);
      const micGainNode = audioContext.createGain();
      monoMicSource.connect(micGainNode);
      monoDisplaySource.connect(micGainNode);
      // micGainNode.connect(audioContext.destination)

      monoMicSource.connect(channelMerger, 0, 0);
      monoDisplaySource.connect(channelMerger, 0, 1);

      // const oscillator = audioContext.createOscillator();
      // oscillator.type = 'sine';
      // oscillator.frequency.setValueAtTime(440, audioContext.currentTime);  // A4 note
      // oscillator.connect(audioContext.destination);
      // oscillator.start();

      micAudioSource.connect(audioContext.destination); 
      try {
        await audioContext.audioWorklet.addModule('audio-worklet.js');
      } catch (error) {
        console.log(`Error adding module: ${error}`);
      }
      //TODO: Create a recording-processor to send over data 
      audioProcessor = new AudioWorkletNode(audioContext, 'recording-processor');
      audioProcessor.port.onmessageerror = (error) => {
        console.log(`Error receiving message from worklet: ${error}`);
      };
  
      // audioProcessor.port.onmessage = async (event) => {
      //   let base64AudioData = await convertBytesToBase64DataUrl(event.data);
      //   socket.send(JSON.stringify({ frames: base64AudioData.split(',')[1] }));
      //   let payload = { action: "AudioData", audio: base64AudioData };
      //   chrome.runtime.sendMessage(payload);
      //   //pcm data chunk processed by the worklet 
      //   audioChunks.push(event.data);
      // };
      audioProcessor.port.onmessage = async (event) => {
        // WAV data chunk received from the processor
        const wavData = event.data;
      
        // Convert WAV data to base64 (if needed for transmission)
        let base64AudioData = await convertBytesToBase64DataUrl(wavData);
      
        // Send base64 audio data to the server via WebSocket
        socket.send(JSON.stringify({ frames: base64AudioData.split(',')[1] }));
      audioLinks.push(JSON.stringify(base64AudioData.split(',')[1]));
        // Send the data to the chrome extension
        let payload = { action: "AudioData", audio: base64AudioData };
        chrome.runtime.sendMessage(payload);
        audioChunks.push(wavData);
      };

      //connect merged channels to the worklet node 
      channelMerger.connect(audioProcessor);
  
    } catch (error) {
      console.log("Error in streaming process", error);
      await terminateStreaming();
    }
  };


  console.log("Loaded recorder.js");
  