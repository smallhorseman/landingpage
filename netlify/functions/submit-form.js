// Located in: netlify/functions/submit-form.js

const fetch = require('node-fetch');

// --- Odoo CRM Integration Function ---
async function createOdooLead(leadData) {
  const { ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_API_KEY } = process.env;

  const endpoint = `${ODOO_URL}/jsonrpc`;
  const uid = await authenticateOdoo(endpoint);

  const params = {
    service: 'object',
    method: 'execute_kw',
    args: [
      ODOO_DB,
      uid,
      ODOO_API_KEY,
      'crm.lead',
      'create',
      [{
        name: `New Lead from Website: ${leadData.name}`,
        contact_name: leadData.name,
        email_from: leadData.email,
        description: leadData.message,
        type: 'lead'
      }]
    ]
  };

  await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: params })
  });
}

async function authenticateOdoo(endpoint) {
    const { ODOO_DB, ODOO_USERNAME, ODOO_API_KEY } = process.env;
    const response = await fetch(`${endpoint.replace('/jsonrpc', '')}/web/session/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                db: ODOO_DB,
                login: ODOO_USERNAME,
                password: ODOO_API_KEY
            }
        })
    });
    const data = await response.json();
    if (!data.result || !data.result.uid) {
        throw new Error('Odoo authentication failed');
    }
    return data.result.uid;
}


// --- Main Handler ---
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const formData = JSON.parse(event.body);
  
  try {
    // --- Task 1: Send Email Notification via Resend ---
    // (Existing Resend logic remains here)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
            from: `Studio 37 Website <noreply@ponyboy.win>`,
            to: 'sales@studio37.cc',
            reply_to: formData.email,
            subject: `New Lead from ${formData.name} - Studio 37 Website`,
            html: `...` // Your existing email HTML
        })
    });

    // --- Task 2: Create Lead in Odoo CRM ---
    await createOdooLead(formData);

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
