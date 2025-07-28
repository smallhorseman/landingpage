// Located in: netlify/functions/generate-ideas.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userIdea } = JSON.parse(event.body);
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!userIdea) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Idea prompt is required.' }) };
    }

    const prompt = `Generate 3 creative and unique photography shoot ideas based on the following theme/keywords: "${userIdea}". For each idea, include a brief concept, potential location types, and a few prop suggestions. Format as a numbered list.`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error('Failed to get ideas from the AI.');
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ ideas: text })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'An internal error occurred.' })
    };
  }
};
