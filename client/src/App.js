import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Meetings from './components/pages/Meetings';
import Calendars from './components/pages/Calendars';
import Journal from './components/pages/Journal';
import SignUp from './components/pages/SignUp';
import MeetingsDetails from './components/pages/MeetingsDetails';
import MoodSurvey from './components/pages/MoodSurvey';
import { auth } from './firebaseConfig'; // Import your Firebase config

function App() {
  const [userEmail, setUserEmail] = useState(null); // State to track user email

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email); // Set user email if signed in
      } else {
        setUserEmail(null); // Clear user email if signed out
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar userEmail={userEmail} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendars" element={<Calendars />} />
        <Route path="/notes" element={<Meetings />} />
        <Route path="/journals" element={<Journal />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/meetingsdetails" element={<MeetingsDetails />} />
        <Route path="/moodsurvey" element={<MoodSurvey />} />
      </Routes>
    </Router>
  );
}

export default App;
