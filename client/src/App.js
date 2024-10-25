import React from 'react';
import './App.css';
import Navbar from './components/Navbar.js';
import Home from './components/pages/Home.js';
import { BrowserRouter as Router, Routes , Route } from 'react-router-dom';
import Meetings from './components/pages/Meetings.js';
import Calendars from './components/pages/Calendars.js';
import Journal from './components/pages/Journal.js';
import SignUp from './components/pages/SignUp.js';
import MeetingsDetails from './components/pages/MeetingsDetails.js';
import MoodSurvey from './components/pages/MoodSurvey.js';
function App() {
  return (
    <>
    <Router>
        <Navbar/>
        <Routes>
          <Route path="/" exact Component={Home}/>
          <Route path="/calendars" exact Component={Calendars}/>
          <Route path="/notes" exact Component={Meetings}/>
          <Route path="/journals" exact Component={Journal}/>
          <Route path="/sign-up" exact Component={SignUp}/>
          <Route path="/meetingsdetails" exact Component={MeetingsDetails}/>
          <Route path="/moodsurvey" exact Component={MoodSurvey}/>
        </Routes>
      </Router>
    
    </>
  );
}

export default App;
