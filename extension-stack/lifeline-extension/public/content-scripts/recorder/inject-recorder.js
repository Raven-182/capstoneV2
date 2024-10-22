//scriipt to inject the recorder
const iframe = document.createElement("iframe");
iframe.setAttribute("hidden", "hidden");
iframe.setAttribute("id", "permissionsIFrame");
iframe.setAttribute("allow", "microphone; camera; display-capture;");
iframe.src = chrome.runtime.getURL("content-scripts/recorder/recorder.html");
document.body.appendChild(iframe);
console.log("-----lifeline-------injected iframe");