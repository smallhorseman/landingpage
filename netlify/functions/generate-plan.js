const fetch = require('node-fetch');

exports.handler = async function(event) {
  // ADDED THIS LINE FOR DEBUGGING
  console.log("generate-plan function has started.");

  if (event.httpMethod !== 'POST') {
    console.error("Error: Received a non-POST request.");
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log("Parsing request body...");
    const { audio, mimeType } = JSON.parse(event.body);
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error("CRITICAL ERROR: GEMINI_API_KEY is not set in Netlify environment variables.");
        throw new Error("Server configuration error: API key is missing.");
    }

    if (!audio || !mimeType) {
      console.error("Error: Missing audio data or mimeType in the request.");
      return { statusCode: 400, body: JSON.stringify({ message: 'Audio data and mimeType are required.' }) };
    }

    console.log("Constructing prompt for Gemini API.");
    const prompt = `
        You are an expert photoshoot planner. Analyze the following client call recording and generate a comprehensive photoshoot plan.
        The plan should be well-structured and easy to read.
        Extract key details like desired locations, themes, moods, specific shots mentioned, number of people, and any other relevant information.
        Organize the output into the following sections:
        - **Project Overview:** A brief summary of the photoshoot.
        - **Key Themes & Moods:** Describe the overall vibe and style.
        - **Proposed Locations:** List potential locations based on the call.
        - **Shot List:** A detailed list of specific shots to capture.
        - **Models/Talent:** Note the number of people and any specific requirements.
        - **Props & Wardrobe:** Suggestions for props and clothing.
        - **Additional Notes:** Any other important details or considerations.
    `;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

    console.log("Sending request to Gemini API...");
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: audio
              }
            }
          ]
        }]
      })
    });

    console.log(`Received response from Gemini API with status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error('Failed to get a plan from the AI.');
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    console.log("Successfully generated plan. Sending response to browser.");
    return {
      statusCode: 200,
      body: JSON.stringify({ plan: text })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'An internal error occurred.' })
    };
  }
};
