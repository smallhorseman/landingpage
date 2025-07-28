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
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        // This is the technical "from" address for authentication.
        // It uses your verified sending domain.
        from: `Studio 37 Website <noreply@ponyboy.win>`,
        
        // This is the destination inbox (yours).
        to: TO_EMAIL,

        // IMPORTANT: This sets the "Reply-To" address to be the customer's email.
        // When you reply to the notification, it will go to them directly.
        reply_to: email,

        subject: `New Lead from ${name} - Studio 37 Website`,
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong><a href="mailto:${email}">${email}</a></p>
          <p><strong>Service of Interest:</strong> ${service || 'Not specified'}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      })
    });

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
