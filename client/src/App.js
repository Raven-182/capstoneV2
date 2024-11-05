import React, { useState, useEffect } from 'react';
import './App.css';
import { Rings } from 'react-loader-spinner';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Meetings from './components/pages/Meetings';
import Calendars from './components/pages/Calendars';
import Journal from './components/pages/Journal';
import SignUp from './components/pages/SignUp';
import MeetingsDetails from './components/pages/MeetingsDetails';
import MoodSurvey from './components/pages/MoodSurvey';
import SurveyHistory from './components/pages/SurveyHistory';
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './firebaseConfig';

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        {/* You can replace this with a spinner or any loading component */}
        <div className="loading-spinner"><Rings color="#00BFFF" height={80} width={80} /></div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar userEmail={userEmail} />
      <Routes>
        <Route
          path="/"
          element={userEmail ? <Home /> : <Navigate to="/sign-up" />}
        />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/calendars"
          element={
            <ProtectedRoute user={userEmail}>
              <Calendars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute user={userEmail}>
              <Meetings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journals"
          element={
            <ProtectedRoute user={userEmail}>
              <Journal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetingsdetails/:meetingId"
          element={
            <ProtectedRoute user={userEmail}>
              <MeetingsDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey-history"
          element={
            <ProtectedRoute user={userEmail}>
              <SurveyHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moodsurvey"
          element={
            <ProtectedRoute user={userEmail}>
              <MoodSurvey />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;