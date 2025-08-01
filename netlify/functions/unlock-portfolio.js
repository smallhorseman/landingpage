// Located in: netlify/functions/unlock-portfolio.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  // We only want to handle POST requests to this function.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the incoming data from the form
    const { name, email, phone } = JSON.parse(event.body);
    
    // Securely get the API key and set your admin email from environment variables
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = 'sales@studio37.cc';
    const SENDER_EMAIL = 'Studio 37 <noreply@ponyboy.win>';
    const LOGO_URL = 'https://live.staticflickr.com/65535/54682452016_5e3a5330ea_b.jpg'; // Direct link to your logo

    // --- Task 1: Create the coupon email to send to the new lead ---
    const couponEmailPromise = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: email,
        subject: `Here's Your 10% Off Coupon from Studio 37!`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${LOGO_URL}" alt="Studio 37 Logo" style="max-width: 150px;" />
              </div>
              <h1 style="font-size: 24px; color: #1a202c;">Thank You for Unlocking Our Portfolio!</h1>
              <p>Hi ${name},</p>
              <p>We're excited to share our full collection of work with you. As promised, here is your coupon for <strong>10% OFF</strong> any photography session.</p>
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; font-weight: bold;">Your Coupon Code:</p>
                <p style="font-size: 28px; font-weight: bold; color: #c05621; background-color: #fefcbf; padding: 10px 20px; border-radius: 5px; display: inline-block;">WELCOME10</p>
              </div>
              <p>Simply mention this code when booking your session with us. We look forward to capturing your moments!</p>
              <p>Best,</p>
              <p>The Team at Studio 37</p>
            </div>
          </div>
        `
      })
    });

    // --- Task 2: Create the notification email to send to the admin ---
    const adminNotificationPromise = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: SENDER_EMAIL,
          to: ADMIN_EMAIL,
          reply_to: email,
          subject: `New Portfolio Unlock Lead: ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>New Lead from Portfolio Unlock</h2>
              <p>A new potential client has unlocked the portfolio to get a coupon.</p>
              <hr>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            </div>
          `
        })
      });

    // Send both emails at the same time and wait for them to complete.
    const [couponResponse, adminResponse] = await Promise.all([couponEmailPromise, adminNotificationPromise]);

    // Check if either of the API calls failed.
    if (!couponResponse.ok || !adminResponse.ok) {
        console.error("Resend API Error - Coupon Status:", await couponResponse.text());
        console.error("Resend API Error - Admin Status:", await adminResponse.text());
        throw new Error('One or more emails failed to send.');
    }

    // If everything was successful, return a success message.
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success! Check your email for the coupon." })
    };

  } catch (error) {
    // If any part of the process fails, log the error and return a generic error message.
    console.error('Portfolio Unlock Function Error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ message: 'An unexpected error occurred. Please try again.' }) 
    };
  }
};
