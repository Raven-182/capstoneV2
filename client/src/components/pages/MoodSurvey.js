import React, { useState, useEffect } from 'react';//hooks allow to manage component state and handles updating background
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import '../../App.css';
import '../../components/moodsurvey.css';

const MoodSurvey = () => {//functional component of moodsurvey(main LOGIC  and UI components for mood survey application)

  //Declares state variables using React’s useState hook
  const [dayQuality, setDayQuality] = useState('good');
  const [exerciseTime, setExerciseTime] = useState('no');
  const [mealsCount, setMealsCount] = useState('one');
  const [extraDetails, setExtraDetails] = useState('');
  const [moodScore, setMoodScore] = useState(null);//moodscore returned from the backend
  const [suggestions, setSuggestions] = useState('');//suggestions from server (default it will be an empty string)
  const [backgroundColor, setBackgroundColor] = useState('');
  const [sectionBackgroundColor, setSectionBackgroundColor] = useState('');//background mood change color 

  // Helper function to get mood emoji, takes the mood (positive, neutral, negative) and returns an emoji representing mood, empty string default
  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      positive: '🚶‍♂️😊',
      neutral: '🚶‍♂️😐',
      negative: '🚶‍♂️😞',
    };
    return moodEmojis[mood] || '';
  };

  // Function to update background colors based on mood
  const updateBackgroundColors = (mood) => {
    const moodColors = {
      positive: { main: 'rgba(75, 192, 192, 0.8)', section: 'rgba(75, 192, 192, 0.2)' },
      neutral: { main: 'rgba(255, 255, 0, 0.8)', section: 'rgba(255, 255, 0, 0.2)' },
      negative: { main: 'rgba(255, 99, 132, 0.8)', section: 'rgba(255, 99, 132, 0.2)' },
    };

    const colors = moodColors[mood] || moodColors['neutral'];
    setBackgroundColor(colors.main);
    setSectionBackgroundColor(colors.section);
  };

  // Function fetchMoodAnalysis function, which sends the user's data to the server for analysis:
  const fetchMoodAnalysis = async (data) => {
    try {
      const response = await fetch('http://localhost:9000/api/survey/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();//converts it back to Javascript object to be displayed in frontend
    } catch (error) {
      console.error('Error analyzing mood:', error);
    }
  };

  
  // Function to handle mood analysis result which is the result returned from the backend
  const handleMoodAnalysisResult = (result) => {
    const { mood, score, suggestions } = result;// result is the response object
    alert(`Your mood is: ${mood}`);
    setMoodScore(score);
    setSuggestions(suggestions);
    updateBackgroundColors(mood);
  };

  // Function to handle form submission when clicked on analyse mood in frontend this method is awake
  const handleSubmit = async (e) => {
    e.preventDefault();//prevents page from refreshing
    const data = { description: dayQuality, extraDetails, exerciseTime, mealsCount };
    const result = await fetchMoodAnalysis(data);
    handleMoodAnalysisResult(result);
  };

  // Hook to apply background color on component update
  useEffect(() => {
    if (backgroundColor) {
      document.body.style.backgroundColor = backgroundColor;
    }
    return () => {
      document.body.style.backgroundColor = ''; // Reset on unmount
    };
  }, [backgroundColor]);

  return (//JSX returned by mood survey component
    <div className="survey-page-container">
      <div className="survey-flex-container">
        {/* Form Section */}
        <FormSection
          dayQuality={dayQuality}
          setDayQuality={setDayQuality}
          exerciseTime={exerciseTime}
          setExerciseTime={setExerciseTime}
          mealsCount={mealsCount}
          setMealsCount={setMealsCount}
          extraDetails={extraDetails}
          setExtraDetails={setExtraDetails}
          handleSubmit={handleSubmit}
        />
        {/* Progress and Suggestions Section */}
        <ProgressSection
          moodScore={moodScore}
          suggestions={suggestions}
          sectionBackgroundColor={sectionBackgroundColor}
          getMoodEmoji={getMoodEmoji}
        />
      </div>
    </div>
  );
};

// Separate Form Section component
const FormSection = ({
  dayQuality, setDayQuality,
  exerciseTime, setExerciseTime,
  mealsCount, setMealsCount,
  extraDetails, setExtraDetails,
  handleSubmit,
}) => (
  <div className="form-section">
    <h1 className="form-title">Mood Survey</h1>
    <form className="form-container" onSubmit={handleSubmit}>
      <FormGroup
        label="1. How was your day?"
        value={dayQuality}
        onChange={setDayQuality}
        options={['good', 'okay', 'bad']}
      />
      <FormGroup
        label="2. Did you spend time exercising?"
        value={exerciseTime}
        onChange={setExerciseTime}
        options={['yes', 'no']}
      />
      <FormGroup
        label="3. How many meals did you eat today?"
        value={mealsCount}
        onChange={setMealsCount}
        options={['one', 'two', 'three']}
      />
      <div className="form-group">
        <label className="form-label">4. Any extra details you'd like to share?</label>
        <textarea
          className="form-control description-box"
          rows="5"
          placeholder="Enter any extra details in terms of health..."
          value={extraDetails}
          onChange={(e) => setExtraDetails(e.target.value)}
        />
      </div>
      <button className="submit-button" type="submit">
        Analyze Mood
      </button>
    </form>
  </div>
);

// Separate FormGroup component to handle different form inputs
const FormGroup = ({ label, value, onChange, options }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <select className="form-control" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

// Separate Progress Section component
const ProgressSection = ({ moodScore, suggestions, sectionBackgroundColor, getMoodEmoji }) => (
  <div className="progress-suggestions-section" style={{ backgroundColor: sectionBackgroundColor }}>
    {moodScore !== null && (
      <div className="progress-container">
        <h3>Your Mood Score</h3>
        <CircularProgressbar
          value={Math.abs(moodScore)}
          text={`${moodScore}`}
          maxValue={10}
          minValue={-10}
          styles={buildStyles({
            pathColor: moodScore > 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)',
            textColor: '#333',
            trailColor: '#ddd',
          })}
        />
        <div className="mood-emoji" style={{ fontSize: '2rem', marginTop: '10px' }}>
          {getMoodEmoji(moodScore > 0 ? 'positive' : moodScore === 0 ? 'neutral' : 'negative')}
        </div>
      </div>
    )}
    {suggestions && (
      <div className="suggestions-container">
        <h3>Suggestions for Tomorrow</h3>
        <p>{suggestions}</p>
      </div>
    )}
  </div>
);

export default MoodSurvey;



/**color change example**/
/*const mood = 'positive'; // After mood analysis (e.g., positive mood)
const colors = updateBackgroundColors(mood); // Get color based on mood
setBackgroundColor(colors.main); // Set the main color

// The useEffect will detect the change in backgroundColor and apply it
useEffect(() => {
  if (backgroundColor) {
    document.body.style.backgroundColor = backgroundColor; // Apply background color
  }
  return () => {
    document.body.style.backgroundColor = ''; // Reset on unmount
  };
}, [backgroundColor]); // Dependency on backgroundColor state*/