// Located in: netlify/functions/unlock-portfolio.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, email, phone } = JSON.parse(event.body);
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = 'sales@studio37.cc'; // Your internal notification email

  try {
    // --- Task 1: Send the coupon email to the user ---
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `Studio 37 <noreply@ponyboy.win>`,
        to: email, // Send to the user who signed up
        subject: `Here's Your 10% Off Coupon from Studio 37!`,
        html: `
          <h1>Thank You for Unlocking Our Portfolio!</h1>
          <p>Hi ${name},</p>
          <p>We're excited to share our full collection of work with you. As promised, here is your coupon for <strong>10% OFF</strong> any photography session.</p>
          <p><strong>Your Coupon Code: WELCOME10</strong></p>
          <p>Simply mention this code when booking your session with us.</p>
          <p>We look forward to capturing your moments!</p>
          <p>- The Team at Studio 37</p>
        `
      })
    });

    // --- Task 2: Send a notification email to yourself ---
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `Studio 37 Website <noreply@ponyboy.win>`,
          to: ADMIN_EMAIL,
          reply_to: email,
          subject: `New Portfolio Unlock Lead: ${name}`,
          html: `
            <h1>New Lead from Portfolio Unlock</h1>
            <p>Someone has unlocked the portfolio to get a coupon.</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone}</p>
          `
        })
      });

    // --- If both emails are sent successfully ---
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success! Check your email for the coupon." })
    };

  } catch (error) {
    console.error('Portfolio Unlock Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'There was an error. Please try again.' })
    };
  }
};
