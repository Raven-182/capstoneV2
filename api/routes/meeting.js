var express = require('express');
const { OpenAI } = require('openai');
var router = express.Router();
require('dotenv').config();


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Fetching API key from the .env file
});
const { writeMeetingData, getMeetingData, updateMeetingData, deleteMeetingData, getAllMeetingData, putProcessedMeetingData, getAllProcessedMeetingData, getProcessedMeetingData } = require('../firebaseManager');


async function processMeetingTranscript(transcripts) {
  const transcriptText = transcripts.map(t => `${t.speaker}: ${t.transcript}`).join("\n");

  try {
    // 1. Get Key Decisions
    const keyDecisions = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', 
      messages: [
        { role: 'system', content: 'You are a helpful meeting assistant.' },
        {
          role: 'user',
          content: `
            What were the key decisions made in the following transcript? Use gender neutral languge. Use \\n(newline) to separate items.
            Transcript: 
            ${transcriptText}
          `,
        },
      ],
    });

    // 2. Get Work Items
    const workItems = await openai.chat.completions.create({
      model: 'gpt-4', 
      messages: [
        { role: 'system', content: 'You are a helpful meeting assistant.' },
        {
          role: 'user',
          content: `
            What are the key work items (tasks) identified in the following transcript? Use gender neutral languge. Use \\n(newline) to separate items.
            Transcript: 
            ${transcriptText}
          `,
        },
      ],
    });

    // 3. Get Meeting Minutes
    const meetingMinutes = await openai.chat.completions.create({
      model: 'gpt-4', 
      messages: [
        { role: 'system', content: 'You are a helpful meeting assistant.' },
        {
          role: 'user',
          content: `
            Can you summarize the meeting minutes from the following transcript? Use gender neutral languge.
            Transcript: 
            ${transcriptText}
          `,
        },
      ],
    });

    // Extract and return the results
    return {
      keyDecisions: keyDecisions.choices[0].message.content.trim(),
      workItems: workItems.choices[0].message.content.trim(),
      meetingMinutes: meetingMinutes.choices[0].message.content.trim(),
    };
  } catch (error) {
    console.error('Error processing transcript:', error);
    throw new Error('Failed to process the meeting transcript.');
  }
}

function formatProcessedData(processedData) {
  return {
    keyDecisions: processedData.keyDecisions.split('\n').filter(item => item.trim() !== ''),
    workItems: processedData.workItems.split('\n').filter(item => item.trim() !== ''),
    meetingMinutes: processedData.meetingMinutes.split('\n').filter(item => item.trim() !== ''),
  };
}

router.post('/:userId', async function(req, res) {
  const userId = req.params.userId;
  const meetingData = req.body;

  // Save the raw meeting data
  const result = await writeMeetingData(userId, meetingData);

  if (result.success) {
    try {
      // Process the meeting transcript
      const processedData = await processMeetingTranscript(meetingData.transcripts); 
      console.log("Processed"+processedData)
      //format it 
      const formattedData = formatProcessedData(processedData);
      console.log(formattedData);
      // Save the processed data to Firebase
      const processedResult = await putProcessedMeetingData(userId, result.meetingId, formattedData);
      console.log(processedResult)

      if (processedResult.success) {
        res.status(200).json({ message: "Meeting saved and processed successfully", meetingId: result.meetingId });
      } else {
        res.status(500).json({ message: "Failed to save processed meeting data", error: processedResult.error });
      }
    } catch (error) {
      res.status(500).json({ message: "Error processing meeting data", error: error.message });
    }
  } else {
    res.status(500).json({ message: "Failed to save meeting", error: result.error });
  }
});


router.get('/:userId/meetings/:meetingId', async function(req, res) {
  const userId = req.params.userId;
  const meetingId = req.params.meetingId;

  const result = await getMeetingData(userId, meetingId);

  if (result.success) {
      res.status(200).json(result.data);
  } else {
      res.status(404).json({ message: result.message, error: result.error });
  }
});


// Get all meetings for a user
router.get('/:userId/meetings', async function(req, res) {
  const userId = req.params.userId;

  const result = await getAllMeetingData(userId);

  if (result.success) {
      res.status(200).json(result.data);
  } else {
      res.status(404).json({ message: result.message, error: result.error });
  }
});


  // Get a specific processed meeting by ID
router.get('/:userId/processed/:meetingId', async function(req, res) {
  const userId = req.params.userId;
  const meetingId = req.params.meetingId;

  const result = await getProcessedMeetingData(userId, meetingId);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ message: result.message, error: result.error });
  }
});

// Get all processed meetings for a user
router.get('/:userId/processed', async function(req, res) {
  const userId = req.params.userId;

  const result = await getAllProcessedMeetingData(userId);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ message: result.message, error: result.error });
  }
});
// Update a meeting
router.put('/:userId/:meetingId', async function(req, res) {
  const userId = req.params.userId;
  const meetingId = req.params.meetingId;
  const updatedData = req.body;

  const result = await updateMeetingData(userId, meetingId, updatedData);

  if (result.success) {
    res.status(200).json({ message: "Meeting updated successfully" });
  } else {
    res.status(500).json({ message: "Failed to update meeting", error: result.error });
  }
});

// Delete a meeting
router.delete('/:userId/:meetingId', async function(req, res) {
  const userId = req.params.userId;
  const meetingId = req.params.meetingId;

  const result = await deleteMeetingData(userId, meetingId);

  if (result.success) {
    res.status(200).json({ message: "Meeting deleted successfully" });
  } else {
    res.status(500).json({ message: "Failed to delete meeting", error: result.error });
  }
});

module.exports = router;
