// Located in: netlify/functions/unlock-portfolio.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { name, email, phone } = JSON.parse(event.body);
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = 'sales@studio37.cc';

  try {
    // Send coupon to user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: `Studio 37 <noreply@ponyboy.win>`,
        to: email,
        subject: `Here's Your 10% Off Coupon from Studio 37!`,
        html: `<h1>Thank You!</h1><p>Here is your coupon for <strong>10% OFF</strong> any session: <strong>WELCOME10</strong></p>`
      })
    });
    // Send notification to admin
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: `Studio 37 Website <noreply@ponyboy.win>`,
          to: ADMIN_EMAIL,
          reply_to: email,
          subject: `New Portfolio Unlock Lead: ${name}`,
          html: `<h1>New Portfolio Unlock</h1><p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p>`
        })
      });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success! Check your email for the coupon." })
    };
  } catch (error) {
    console.error('Portfolio Unlock Error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'There was an error. Please try again.' }) };
  }
};
