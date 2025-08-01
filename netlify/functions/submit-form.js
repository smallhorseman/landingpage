// Located in: netlify/functions/submit-form.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const formData = JSON.parse(event.body);
  const { name, email, service, message } = formData;
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL = 'sales@studio37.cc';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `Studio 37 Website <noreply@ponyboy.win>`,
        to: TO_EMAIL,
        reply_to: email,
        subject: `New Lead from ${name} - Studio 37 Website`,
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Service of Interest:</strong> ${service || 'Not specified'}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API Error:', errorData);
      throw new Error('Failed to send message due to a server error.');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Thank you for your message! We will be in touch soon." })
    };

  } catch (error) {
    console.error('Submission Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'There was an error submitting the form.' })
    };
  }
};
