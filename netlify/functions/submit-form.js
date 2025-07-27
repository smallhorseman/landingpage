// This is a placeholder for our backend function.
// It will process the form submission.

exports.handler = async function(event, context) {
  // We're just logging the data for now.
  // In the next steps, we will add code here to send an email
  // and later, to connect to Odoo CRM.
  console.log("Form data received:", event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Form submitted successfully! We will be in touch soon." })
  };
};