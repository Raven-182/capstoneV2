import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { db } from '../../firebaseConfig'; 
import { doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication
import '../surveyhistory.css';

const SurveyHistory = () => {
  const location = useLocation();
  const [surveys, setSurveys] = useState(location.state?.surveys || []);
  const auth = getAuth(); // Get the Firebase auth instance
  const user = auth.currentUser; // Get the current user

  // Delete survey function
  const handleDelete = async (id) => {
    try {
      if (user) {
        await deleteDoc(doc(db, 'users', user.uid, 'moodSurveys', id));
        setSurveys(surveys.filter((survey) => survey.id !== id)); // Update local state
        console.log("Survey deleted successfully");
      } else {
        console.error("No user is signed in.");
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  return (
    <div className="survey-history-container">
      <h2>Survey History</h2>
      {surveys.length > 0 ? (
        <table className="survey-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Mood Score</th>
              <th>Day Quality</th>
              <th>Exercise Time</th>
              <th>Meals Count</th>
              <th>Extra Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey.id}>
                <td>{new Date(survey.timestamp.seconds * 1000).toLocaleDateString()}</td>
                <td>{survey.moodScore}</td>
                <td>{survey.dayQuality}</td>
                <td>{survey.exerciseTime}</td>
                <td>{survey.mealsCount}</td>
                <td>{survey.extraDetails}</td>
                <td>
                  <button
                    onClick={() => handleDelete(survey.id)}
                    className="delete-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No previous surveys found.</p>
      )}
      <Link to="/moodsurvey">Back to Mood Survey</Link>
    </div>
  );
};

export default SurveyHistory;
