import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { db } from '../../firebaseConfig'; // Adjust this path if necessary
import { doc, deleteDoc } from 'firebase/firestore';
import '../surveyhistory.css';

const SurveyHistory = () => {
  const location = useLocation();
  const [surveys, setSurveys] = useState(location.state?.surveys || []);

  // Delete survey function
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'surveys', id)); // Assumes 'surveys' is the collection name
      setSurveys(surveys.filter((survey) => survey.id !== id)); // Update local state
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
                    className="delete-button" >
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
