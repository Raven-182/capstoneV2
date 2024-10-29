import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Meetings from './components/pages/Meetings';
import Calendars from './components/pages/Calendars';
import Journal from './components/pages/Journal';
import SignUp from './components/pages/SignUp';
import MeetingsDetails from './components/pages/MeetingsDetails';
import MoodSurvey from './components/pages/MoodSurvey';
import { auth } from './firebaseConfig'; // Import your Firebase config
import SurveyHistory from './components/pages/SurveyHistory';

function App() {
  const [userEmail, setUserEmail] = useState(null); // State to track user email
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email); // Set user email if signed in
      } else {
        setUserEmail(null); // Clear user email if signed out
      }
      setLoading(false); // Set loading to false after checking auth state
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Display loading message while checking auth
  }

  return (
    <Router>
      <Navbar userEmail={userEmail} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendars" element={<Calendars />} />
        <Route 
          path="/notes" 
          element={userEmail ? <Meetings /> : <Navigate to="/" />} // Redirect if not authenticated
        />
        <Route path="/journals" element={<Journal />} />
        <Route path="/sign-up" element={<SignUp />} />
        {/* <Route path="/meetingsdetails" element={<MeetingsDetails />} /> */}
        <Route path="/meetingsdetails/:meetingId" element={<MeetingsDetails />} />
        <Route path="/survey-history" element={<SurveyHistory />} />
        <Route path="/moodsurvey" element={<MoodSurvey />} />
      </Routes>
    </Router>
  );
}

export default App;


