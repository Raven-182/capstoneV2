document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const audioPlayer = document.getElementById('audioPlayer');

    startButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "StartTranscription" });
        startButton.disabled = true;
        console.log("Pressed start")
        stopButton.disabled = false;
    });

    stopButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "StopTranscription" });
        startButton.disabled = false;
        stopButton.disabled = true;
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "AudioProcessed") {
            // audioPlayer.src = request.audio;
            // Create a download link for the audio file
            // Set the received audio URL in the player
            // audioBlobURL = request.audio;
            // audioPlayer.src = request.audio;
            // const downloadLink = document.createElement('a');
            // downloadLink.href = audioBlobURL;
            // downloadLink.download = 'recorded_audio.mp3'; // Suggested file name
            // downloadLink.textContent = 'Download Audio';

            // // Append the download link to the body or a container
            // document.body.appendChild(downloadLink);
            audioBlob = request.audio;
            // const audioBlob = new Blob(audioBlobs, { type: 'audio/wav'});
            //var snd = new Audio("data:audio/wav;base64," + base64);
            // snd.play();
            // const audio = new Audio();
            audioPlayer.src = audioBlob;



            // audioPlayer.src = request.audio;
            // audioPlayer.play();
            // console.log("Hi Mark 1")
            // // Optionally, create a download link for the audio
            // const downloadLink = document.createElement('a');
            // downloadLink.href = request.audio; // The base64-encoded audio URL
            // downloadLink.download = 'recorded_audio.wav';  // Suggested file name
            // downloadLink.textContent = 'Download Audio';

            // // Append the download link to the body or a specific container
            // document.body.appendChild(downloadLink);
            }
    });

 
});

