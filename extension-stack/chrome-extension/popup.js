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
        if (request.action === "AudioData") {
            audioPlayer.src = request.audio;
        }
    });
});
