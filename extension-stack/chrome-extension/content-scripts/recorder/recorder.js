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
let isRecording = false;

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.action === "StartTranscription" && !isRecording) {
    console.log("Received start transcription request", request);
    initiateStreaming();
    isRecording = true; // Set the flag to prevent re-triggering
  } else if (request.action === "StopTranscription" && isRecording) {
    console.log("Received stop transcription request", request);
    terminateStreaming();
    isRecording = false; // Reset the flag
  }
});

  /* Global variables */
  let audioProcessor = undefined;
  let samplingRate = 44100;
  let audioContext;
  let displayStream;
  let micStream;
  
  /* Helper functions */
  const convertBytesToBase64DataUrl = async (bytes, type = "application/octet-stream") => {
    return await new Promise((resolve, reject) => {
      const reader = Object.assign(new FileReader(), {
        onload: () => resolve(reader.result),
        onerror: () => reject(reader.error),
      });
      reader.readAsDataURL(new File([bytes], "", { type }));
    });
  }
  
  const encodePcm = (input) => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i += 1) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };
  
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
  
      let displayAudioSource = audioContext.createMediaStreamSource(displayStream);
      let micAudioSource = audioContext.createMediaStreamSource(micStream);
  
      let monoDisplaySource = mergeToMono(displayAudioSource);
      let monoMicSource = mergeToMono(micAudioSource);
  
      let channelMerger = audioContext.createChannelMerger(2);
      monoMicSource.connect(channelMerger, 0, 0);
      monoDisplaySource.connect(channelMerger, 0, 1);
  
      try {
        await audioContext.audioWorklet.addModule('audio-worklet.js');
      } catch (error) {
        console.log(`Error adding module: ${error}`);
      }
  
      audioProcessor = new AudioWorkletNode(audioContext, 'recording-processor');
      audioProcessor.port.onmessageerror = (error) => {
        console.log(`Error receiving message from worklet: ${error}`);
      };
  
      audioProcessor.port.onmessage = async (event) => {
        let base64AudioData = await convertBytesToBase64DataUrl(event.data);
        let payload = { action: "AudioData", audio: base64AudioData };
        chrome.runtime.sendMessage(payload);
      };
      channelMerger.connect(audioProcessor);
  
    } catch (error) {
      console.log("Error in streaming process", error);
      await terminateStreaming();
    }
  };
  
  console.log("Loaded recorder.js");
  