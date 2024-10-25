console.log("Inside Lifeline Assistant Zoom script");

let meetingConfig = {};

const extractSpeakerName = function (element) {
  console.log(`mark 1 ${element.className}`)
  var speakerName = "n/a";
  var nameElement = element.querySelector('.video-avatar__avatar-name');
  if (nameElement) {
    speakerName = nameElement.innerText;
  } else if (element.className == ".multi-speaker-main-container__video-frame.multi-speaker-main-container__video-frame--active"){
    let activeSpeakerElement = element.querySelector(".multi-speaker-main-container__video-frame.multi-speaker-main-container__video-frame--active");
      console.log("mark 1.5")
      console.log("Active Speaker Element:", activeSpeakerElement);
    if (activeSpeakerElement){
      console.log(`mark 2 ${activeSpeakerElement.className}`)
      let nameElement = activeSpeakerElement.querySelector(".video-avatar__avatar-name");
      speakerName = nameElement.innerText;
    }

  }

  else{
    var imageElement = element.querySelector('.video-avatar__avatar-img');
    if (imageElement) {
      speakerName = imageElement.alt;
    }
  }
  return speakerName;
}

/************ Handling Participant Changes **************/
const onParticipantListChange = function (summaries) {
  console.log("Participant list changed");
  summaries.forEach(function (summary) {
    summary.added.forEach(function (newParticipant) {
      const speakerName = extractSpeakerName(newParticipant);
      console.log("New Participant Added:", speakerName);
    });
    summary.removed.forEach(function (removedParticipant) {
      const speakerName = extractSpeakerName(removedParticipant);
      console.log("Participant Removed:", speakerName);
    });
  });
}

var participantObserver = new MutationSummary({
  callback: onParticipantListChange,
  queries: [
    { element: '.video-avatar__avatar' }
  ]
});

const onActiveSpeakerChange = function (summaries) {
  console.log("Active Speaker change detected");
  summaries.forEach(function (summary) {
    summary.added.forEach(function (activeSpeaker) {
      const speakerName = extractSpeakerName(activeSpeaker);
      console.log("Active Speaker Changed:", speakerName);
      chrome.runtime.sendMessage({ action: "ActiveSpeakerChange", active_speaker: speakerName });
    });
  });
}

var activeSpeakerObserver = new MutationSummary({
  callback: onActiveSpeakerChange,
  queries: [
    { element: '.speaker-active-container__video-frame' },
    { element: '.speaker-bar-container__video-frame--active' },
    { element: '.gallery-video-container__video-frame--active' },
    { element: '.multi-speaker-main-container__video-frame.multi-speaker-main-container__video-frame--active' },
    

  ]
});

/************ Handling Mute/Unmute Changes *************/
const onMuteStatusChange = function (summaries) {
  console.log("Mute status change detected");
  let isMuted = false;
  for (let element of document.getElementsByClassName('footer-button-base__button-label')) {
    if (element.innerText === "Unmute") {
      isMuted = true;
    }
  }
  chrome.runtime.sendMessage({ action: "MuteChange", mute: isMuted });
};

var muteObserver = new MutationSummary({
  callback: onMuteStatusChange,
  queries: [
    { element: '.video-avatar__avatar-footer--view-mute-computer' },
    { element: '.footer-button-base__img-layer' },
    { element: '.footer-button-base__button-label' }
  ]
});

/************ Chat Panel Operations ************/
const openChatPanelIfNeeded = function () {
  const chatPanelButtons = document.querySelectorAll('[aria-label*="open the chat panel"]');
  if (chatPanelButtons.length > 0) {
    chatPanelButtons[0].click(); // Open the chat panel
  }
}

const sendMessageToChat = function (message) {
  const chatSendButtons = document.getElementsByClassName("chat-rtf-box__send");
  if (chatSendButtons.length > 0) {
    const textBoxContainer = document.getElementsByClassName("chat-rtf-box__editor-outer");
    if (textBoxContainer.length > 0) {
      const textBox = textBoxContainer[0].querySelectorAll("p");
      if (textBox.length > 0) {
        textBox[0].innerText = message;
      }
    }
    setTimeout(() => {
      chatSendButtons[0].click();
    }, 250);
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "FetchMetadata") {
    console.log("Received request to send meeting config");
    if (Object.keys(meetingConfig).length > 0) {
      sendResponse(meetingConfig);
    }
  } else if (request.action === "SendChatMessage") {
    console.log("Received request to send a chat message");
    let chatWindow = document.getElementsByClassName("chat-rtf-box__editor-outer");
    if (chatWindow.length === 0) {
      openChatPanelIfNeeded();
    }
    setTimeout(() => {
      sendMessageToChat(request.message);
    }, 500);
  }
});

/************ Inject Script Function ************/
function injectScript(file) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(file);
  script.onload = function () {
    script.remove();
  }

  const target = document.head || document.documentElement;
  if (target) {
    target.appendChild(script);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      (document.head || document.documentElement).appendChild(script);
    });
  }
}

injectScript('content-scripts/providers/inject-zoom.js');

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data.type && (event.data.type === "MeetingConfig")) {
    console.log("Received value from page:", event.data.value);
    meetingConfig = event.data.value;
    chrome.runtime.sendMessage({ action: "UpdateMetadata", metadata: event.data.value });
  }
});
