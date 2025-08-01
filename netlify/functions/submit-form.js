// Located in: netlify/functions/unlock-portfolio.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const formData = JSON.parse(event.body);

  try {
    // --- Task 1: Create Lead in Odoo via our new app endpoint ---
     await fetch(process.env.ODOO_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body // Forward the exact same JSON data
    });

    // --- Task 2: Send Coupon Email & Admin Notification via Resend ---
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    // Send coupon to user
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
            from: `Studio 37 <noreply@ponyboy.win>`,
            to: formData.email,
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
            to: 'sales@studio37.cc',
            reply_to: formData.email,
            subject: `New Portfolio Unlock Lead: ${formData.name}`,
            html: `<h1>New Portfolio Unlock</h1><p>Name: ${formData.name}</p><p>Email: ${formData.email}</p><p>Phone: ${formData.phone}</p>`
        })
    });

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
