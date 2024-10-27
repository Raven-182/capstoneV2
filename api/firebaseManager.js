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

module.exports = { writeMeetingData, getMeetingData, updateMeetingData, deleteMeetingData, getAllMeetingData };

/************************************* Mood survey methods  *************** */

// Write mood survey data
function writeMoodSurveyData(userId, moodSurveyData) {
  const db = getDatabase();
  const moodSurveyRef = db.ref('users/' + userId + '/moodSurveys').push();  // Automatically generates a unique key for each survey

  // Pass the moodSurveyData as the first argument to set()
  return moodSurveyRef.set(moodSurveyData)
    .then(() => {
      console.log("Mood survey data saved successfully.");
      return { success: true, moodSurveyId: moodSurveyRef.key };  // Return the generated moodSurveyId
    })
    .catch((error) => {
      console.error("Error saving mood survey data:", error);
      return { success: false, error };
    });
}

// Read specific mood survey data
function getMoodSurveyData(userId, moodSurveyId) {
  const db = getDatabase();
  const moodSurveyRef = db.ref('users/' + userId + '/moodSurveys/' + moodSurveyId);

  return moodSurveyRef.get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: false, message: "No mood survey data found." };
      }
    })
    .catch((error) => {
      console.error("Error fetching mood survey data:", error);
      return { success: false, error: error.message };  
    });
}

// Update mood survey data
function updateMoodSurveyData(userId, moodSurveyId, moodSurveyData) {
  const db = getDatabase();
  const moodSurveyRef = db.ref('users/' + userId + '/moodSurveys/' + moodSurveyId);

  return moodSurveyRef.update(moodSurveyData)
    .then(() => {
      console.log("Mood survey data updated successfully.");
      return { success: true };
    })
    .catch((error) => {
      console.error("Error updating mood survey data:", error);
      return { success: false, error: error.message };  
    });
}

// Delete mood survey data
function deleteMoodSurveyData(userId, moodSurveyId) {
  const db = getDatabase();
  const moodSurveyRef = db.ref('users/' + userId + '/moodSurveys/' + moodSurveyId);

  return moodSurveyRef.remove()
    .then(() => {
      console.log("Mood survey data deleted successfully.");
      return { success: true };
    })
    .catch((error) => {
      console.error("Error deleting mood survey data:", error);
      return { success: false, error: error.message };  
    });
}

// Get all mood survey data for a user
async function getAllMoodSurveyData(userId) {
  const db = getDatabase();
  const moodSurveysRef = db.ref('users/' + userId + '/moodSurveys');

  try {
    const snapshot = await moodSurveysRef.get();
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() }; // Return all mood survey data
    } else {
      return { success: false, message: "No mood surveys found." };
    }
  } catch (error) {
    console.error("Error fetching mood surveys data:", error);
    return { success: false, error };
  }
}

/************************************* Mood survey methods  *************** */
// Function to retrieve mood surveys for a user on a specific date
async function getMoodSurveysByDate(userId, date) {
  const db = getDatabase();
  const moodSurveysRef = ref(db, 'users/' + userId + '/moodSurveys');

  // Define the start and end times for the specified date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const snapshot = await get(query(
      moodSurveysRef,
      orderByChild('timestamp'),
      startAt(startOfDay.toISOString()),
      endAt(endOfDay.toISOString())
    ));

    if (snapshot.exists()) {
      const surveys = [];
      snapshot.forEach((childSnapshot) => {
        surveys.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      return { success: true, data: surveys };
    } else {
      return { success: false, message: "No mood surveys found for this date." };
    }
  } catch (error) {
    console.error("Error fetching mood surveys data by date:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { 
  writeMoodSurveyData, 
  getMoodSurveyData,
  getMoodSurveysByDate, 
  updateMoodSurveyData, 
  deleteMoodSurveyData, 
  getAllMoodSurveyData 
};
