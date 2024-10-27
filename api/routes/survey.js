const express = require('express');
const router = express.Router();
const cors = require('cors'); // Enable cross-origin sharing
const bodyParser = require('body-parser'); // Parses incoming request bodies
const Sentiment = require('sentiment'); // Sentiment library for text analysis
const OpenAI = require('openai');
const { writeMoodSurveyData, getAllMoodSurveyData } = require('../firebaseManager'); // Import Firebase methods
const admin = require('firebase-admin');

// Load environment variables from the .env file
require('dotenv').config();

// Initialize OpenAI with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Fetching API key from the .env file
});

router.use(cors());
router.use(express.json()); // Middleware for parsing JSON

// Initialize sentiment analysis
const sentiment = new Sentiment();

/**
 * Middleware to verify Firebase ID Token
 */
const verifyIdToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.userId = decodedToken.uid; // Attach userId to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(403).json({ message: 'Unauthorized' });
  }
};

/**
 * Function to construct the OpenAI prompt based on user's input.
 */
function createPrompt(dayQuality, exerciseTime, mealsCount, extraDetails) {
  let prompt = `User's day was described as: "${dayQuality}".\n\n`;

  if (exerciseTime === 'no') {
    prompt += `\n**Exercise Suggestions:**\nThey did not exercise today. Suggest a simple exercise routine they could try tomorrow.\n\n`;
  }

  if (mealsCount === 'one') {
    prompt += `\n**Diet Suggestions:**\nThey had only one meal today. Suggest healthy meals to improve their diet.\n\n`;
  } else if (mealsCount === 'two') {
    prompt += `\n**Diet Suggestions:**\nThey had two meals today. Suggest one more healthy meal they could add.\n\n`;
  } else if (mealsCount === 'three') {
    prompt += `\n**Diet Suggestions:**\nThey had three meals today. Good job, but remind them to eat wisely.\n\n`;
  }

  if (extraDetails) {
    prompt += `\n**Extra Details:**\nAdditional details: "${extraDetails}".\n\n`;
  }

  prompt += `\nProvide suggestions for improving their mood and health tomorrow.`;

  return prompt;
}

/**
 * Function to fetch suggestions from OpenAI API
 */
async function fetchSuggestionsFromOpenAI(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return 'Sorry, I couldn’t generate suggestions at the moment.';
  }
}

/**
 * Function to calculate mood score based on user's input
 */
function calculateMoodScore(description, exerciseTime, mealsCount) {
  let moodScore = 0;

  switch (description) {
    case 'good':
      moodScore += 10;
      break;
    case 'okay':
      moodScore += 5;
      break;
    case 'bad':
      moodScore -= 5;
      break;
  }

  if (exerciseTime === 'yes') moodScore += 5;

  switch (mealsCount) {
    case 'three':
      moodScore += 10;
      break;
    case 'two':
      moodScore += 5;
      break;
    case 'one':
      moodScore -= 5;
      break;
  }

  return moodScore;
}

/**
 * Function to analyze the mood based on moodScore
 */
function analyzeMood(moodScore) {
  if (moodScore > 10) return 'positive';
  if (moodScore > 0) return 'neutral';
  return 'negative';
}

/**
 * POST Route to analyze user's mood and provide suggestions
 */
router.post('/analyze', verifyIdToken, async (req, res) => {
  const userId = req.userId;  // Extracted from verified token by middleware
  const { description, extraDetails, exerciseTime, mealsCount } = req.body;

  console.log('Received Data:', { userId, description, extraDetails, exerciseTime, mealsCount });

  const moodScore = calculateMoodScore(description, exerciseTime, mealsCount);
  const mood = analyzeMood(moodScore);

  const prompt = createPrompt(description, exerciseTime, mealsCount, extraDetails);
  const suggestions = await fetchSuggestionsFromOpenAI(prompt);

  // Prepare the mood survey data
  const moodSurveyData = {
    description,
    extraDetails,
    exerciseTime,
    mealsCount,
    mood,
    score: moodScore,
    suggestions,
    timestamp: new Date().toISOString() // Add timestamp for when the survey was taken
  };

  // Save mood survey data to Firebase
  const result = await writeMoodSurveyData(userId, moodSurveyData);
  if (result.success) {
    res.json({ message: "Mood survey saved successfully", mood, score: moodScore, suggestions });
  } else {
    res.status(500).json({ message: "Failed to save mood survey", error: result.error });
  }
});

/**
 * GET Route to retrieve all mood surveys for a user
 */
router.get('/surveys', verifyIdToken, async (req, res) => {
  const userId = req.userId; // Extracted from verified token by middleware

  // Fetch all mood surveys from Firebase
  const result = await getAllMoodSurveyData(userId);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(404).json({ message: result.message, error: result.error });
  }
});

module.exports = router;
