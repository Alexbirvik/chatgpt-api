// backend/controllers/chatController.js
import axios from 'axios';
import validateInput from './validateInput.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export default async (req, res) => {
  const { messages, model } = req.body; // Receive model from frontend

  // Input validation
  if (!validateInput(messages)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: model || 'gpt-4o-2024-08-06', // Use the model from the frontend, default to 'gpt-4o' if not provided
        messages
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'X-OpenAI-Data-Usage': 'off'
        }
      }
    );

    res.json({
        choices: response.data.choices,
        usage: response.data.usage,
    });
      
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch response from OpenAI API' });
  }
};

