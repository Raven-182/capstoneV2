var express = require('express');
var router = express.Router();
const { writeMeetingData, getMeetingData, updateMeetingData, deleteMeetingData, getAllMeetingData } = require('../firebaseManager');

// Create a new meeting
router.post('/:userId', async function(req, res) {
  const userId = req.params.userId;
  const meetingData = req.body;

  const result = await writeMeetingData(userId, meetingData);
  
  if (result.success) {
    res.status(200).json({ message: "Meeting saved successfully", meetingId: result.meetingId });
  } else {
    res.status(500).json({ message: "Failed to save meeting", error: result.error });
  }
});

// Get a meeting by ID
router.get('/:userId/:meetingId', async function(req, res) {
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
router.get('/:userId', async function(req, res) {
    const userId = req.params.userId;
  
    const result = await getAllMeetingData(userId);
  
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
