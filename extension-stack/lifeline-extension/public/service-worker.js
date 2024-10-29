
let meetingConfig = undefined;

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));


  // Function to send meeting data to the server
async function sendMeetingDataToServer(transcripts, userId) {
  if (userId) {
    // Prepare the data payload to send
    const dataToSend = {
      transcripts: transcripts.map(({ speaker, transcript }) => ({
        speaker,
        transcript,
      })),
      meetingTopic: meetingConfig ? meetingConfig.meetingTopic : 'Not found',
      url: meetingConfig ? meetingConfig.baseUrl : 'Not found',               
      email: meetingConfig ? meetingConfig.userEmail : 'Not found',            
    };
    try {

      const response = await fetch(`http://localhost:9000/api/meeting/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log('Meeting data successfully sent to the server');
      } else {
        console.error('Failed to send meeting data to the server:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending meeting data to the server:', error);
    }
  } else {
    console.error('No userId provided.');
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'MeetingProcessed' && message.data) {
    const { transcripts, userId } = message.data; // Extract userId from message
    sendMeetingDataToServer(transcripts, userId);
  } else if (message.action == "UpdateMetadata") {
    if (meetingConfig == undefined){

    meetingConfig = message.metadata;

    // Extracting the meeting topic
    const meetingTopic = meetingConfig.meetingTopic;
    const url = meetingConfig.baseUrl
    const email = meetingConfig.userEmail
    console.log("Meeting data from the service worker", meetingTopic)

    }
  }
});
