const { initializeApp } = require('firebase-admin/app');
const { getDatabase, ref, set, push, get, update, remove } = require('firebase-admin/database');
const admin = require('firebase-admin');
const serviceAccount = require("./ServiceAccount.json");
require('dotenv').config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://capstonefinal-261e1-default-rtdb.firebaseio.com/"
});

// Write meeting data
function writeMeetingData(userId, meetingData) {
  const db = getDatabase();
  const meetingRef = db.ref('users/' + userId + '/meetings').push();  // Will automatically generates a unique key for each meeting

  // Pass the meetingData as the first argument to set()
  return meetingRef.set(meetingData)
    .then(() => {
      console.log("Meeting data saved successfully.");
      return { success: true, meetingId: meetingRef.key };  // Return the generated meetingId
    })
    .catch((error) => {
      console.error("Error saving meeting data:", error);
      return { success: false, error };
    });
}


// Read specific meeting data
function getMeetingData(userId, meetingId) {
  const db = getDatabase();
  const meetingRef = db.ref( 'users/' + userId + '/meetings/' + meetingId);

  return meetingRef.get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: false, message: "No meeting data found." };
      }
    })
    .catch((error) => {
      console.error("Error fetching meeting data:", error);
      return { success: false, error: error.message };  
    });
}


// Update meeting data
function updateMeetingData(userId, meetingId, meetingData) {
  const db = getDatabase();
  const meetingRef = db.ref('users/' + userId + '/meetings/' + meetingId);

  return meetingRef.update( meetingData)
    .then(() => {
      console.log("Meeting data updated successfully.");
      return { success: true };
    })
    .catch((error) => {
      console.error("Error updating meeting data:", error);
      return { success: false, error: error.message };  
    });
}

// Delete meeting data
function deleteMeetingData(userId, meetingId) {
  const db = getDatabase();
  const meetingRef = db.ref( 'users/' + userId + '/meetings/' + meetingId);

  return meetingRef.remove()
    .then(() => {
      console.log("Meeting data deleted successfully.");
      return { success: true };
    })
    .catch((error) => {
      console.error("Error deleting meeting data:", error);
      return { success: false, error: error.message };  
    });
}

// Get all meeting data for a user
async function getAllMeetingData(userId) {
  const db = getDatabase();
  const meetingsRef = db.ref( 'users/' + userId + '/meetings');

  try {
    const snapshot = await meetingsRef.get();
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() }; // Return all meeting data
    } else {
      return { success: false, message: "No meetings found." };
    }
  } catch (error) {
    console.error("Error fetching meetings data:", error);
    return { success: false, error };
  }
}
/************************************* Mood survey methods  *************** */

module.exports = { writeMeetingData, getMeetingData, updateMeetingData, deleteMeetingData, getAllMeetingData };
