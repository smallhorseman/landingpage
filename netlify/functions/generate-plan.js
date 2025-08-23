// This function uses Node.js's built-in 'https' module instead of 'node-fetch'.
const https = require('https');

exports.handler = async function(event) {
  console.log("generate-plan function (native https) has started.");

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { audio, mimeType } = JSON.parse(event.body);
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("CRITICAL ERROR: GEMINI_API_KEY is not set.");
      throw new Error("Server configuration error: API key is missing.");
    }

    if (!audio || !mimeType) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Audio data and mimeType are required.' }) };
    }

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

    const postData = JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: audio } }
        ]
      }]
    });

    // This is the new part that uses the native 'https' module
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(postData);
      req.end();
    });

    const text = result.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ plan: text })
    };

  } catch (error) {
    console.error('Function Error:', error.toString());
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'An internal error occurred.' })
    };
  }
};
