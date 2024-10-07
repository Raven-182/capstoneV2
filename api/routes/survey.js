const express = require('express');
var router = express.Router();
const cors = require('cors');//eneble cross-orgin sharing when front and back and hosted in different environement to communicate
const bodyParser = require('body-parser');//which parses incoming request bodies, making it easier to access data in the req.body object
const Sentiment = require('sentiment');//sentiment library for analysie on text
const OpenAI = require('openai');

// Load environment variables from the .env file
require('dotenv').config();

// Initialize OpenAI with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Fetching API key from the .env file
});

router.use(cors());
router.use(express.json()); // Middleware for parsing JSON,allowing the API to handle requests with JSON bodies.

// Initialize sentiment analysis
const sentiment = new Sentiment();

/**
 * GET Route for verifying the API status
 */
router.get("/", (req, res) => {
  res.send("Survey API is working properly");
});

/**
 * Function to construct the OpenAI prompt based on user's input.
 * @param {string} dayQuality - The description of the user's day (e.g. "good", "bad").
 * @param {string} exerciseTime - Whether the user exercised (e.g. "yes" or "no").
 * @param {string} mealsCount - How many meals the user had (e.g. "one", "two", "three").
 * @param {string} extraDetails - Additional details provided by the user.
 * @returns {string} - The prompt to send to OpenAI.
 */

/*his function constructs a prompt string to be sent to OpenAI. It starts by logging the user's description of their day (e.g., "good", "bad").*/
function createPrompt(dayQuality, exerciseTime, mealsCount, extraDetails) {
  let prompt = `User's day was described as: "${dayQuality}".\n\n`;
   
  // Add exercise suggestions if the user did not exercise
  if (exerciseTime === 'no') {
    prompt += `\n**Exercise Suggestions:**\nThey did not exercise today. Suggest a simple exercise routine they could try tomorrow.\n\n`;
  }

  // Add meal suggestions based on the number of meals
  if (mealsCount === 'one') {
    prompt += `\n**Diet Suggestions:**\nThey had only one meal today. Suggest healthy meals to improve their diet.\n\n`;
  } else if (mealsCount === 'two') {
    prompt += `\n**Diet Suggestions:**\nThey had two meals today. Suggest one more healthy meal they could add.\n\n`;
  } else if (mealsCount === 'three') {
    prompt += `\n**Diet Suggestions:**\nThey had three meals today. Good job, but remind them to eat wisely.\n\n`;
  }

  // Include any extra details provided by the user
  if (extraDetails) {
    prompt += `\n**Extra Details:**\nAdditional details: "${extraDetails}".\n\n`;
  }

  prompt += `\nProvide suggestions for improving their mood and health tomorrow.`;

  return prompt;
}

/**
 * Function to fetch suggestions from OpenAI API
 * @param {string} prompt - The constructed prompt to send to the API
 * @returns {Promise<string>} - The response text from OpenAI
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
 * @param {string} description - The quality of the day
 * @param {string} exerciseTime - Whether the user exercised
 * @param {string} mealsCount - Number of meals the user had
 * @returns {number} - The calculated mood score
 */
function calculateMoodScore(description, exerciseTime, mealsCount) {
  let moodScore = 0;

  // Add points based on day description
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

  // Add points for exercise
  if (exerciseTime === 'yes') moodScore += 5;

  // Add points for meals
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
 * @param {number} moodScore - The calculated mood score
 * @returns {string} - The mood analysis ("positive", "neutral", "negative")
 */
function analyzeMood(moodScore) {
  if (moodScore > 10) return 'positive';
  if (moodScore > 0) return 'neutral';
  return 'negative';
}

/**
 * POST Route to analyze user's mood and provide suggestions
 */
router.post('/analyze', async (req, res) => {
  const { description, extraDetails, exerciseTime, mealsCount } = req.body;

  // Log received data
  console.log('Received Data:', { description, extraDetails, exerciseTime, mealsCount });

  // Calculate mood score and analyze mood
  const moodScore = calculateMoodScore(description, exerciseTime, mealsCount);
  const mood = analyzeMood(moodScore);

  // Construct prompt and get suggestions from OpenAI
  const prompt = createPrompt(description, exerciseTime, mealsCount, extraDetails);
  const suggestions = await fetchSuggestionsFromOpenAI(prompt);

  // Send the mood and suggestions back to the client
  res.json({ mood, score: moodScore, suggestions });
});

module.exports = router;
