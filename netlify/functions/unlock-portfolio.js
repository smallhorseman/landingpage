// Located in: netlify/functions/unlock-portfolio.js

exports.handler = async function(event) {
  // In the future, this function will:
  // 1. Send the lead to Odoo CRM.
  // 2. Send the user an email with their 10% off coupon.
  
  console.log("Portfolio unlock request:", event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success! Redirecting to portfolio..." })
  };
};
