// Periodically check for the MeetingConfig variable and post it to the window
const intervalCheckMeetingConfig = setInterval(() => {
  console.log("in the zoom injectabke")
    if (typeof MeetingConfig !== 'undefined') {
      console.log('MeetingConfig defined:', MeetingConfig);
      window.postMessage({ type: "MeetingConfig", value: MeetingConfig });
      clearInterval(intervalCheckMeetingConfig); // Clear the interval once the config is defined
    } else {
      console.log('MeetingConfig not yet defined.');
    }
  }, 1000);
  