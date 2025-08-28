const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('API Key:', process.env.SENDGRID_API_KEY ? 'Found' : 'Not found');
console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);

const msg = {
  to: 'bristolsteve88@gmail.com',
  from: 'cornerstonebank@accountant.com',
  subject: 'SendGrid Test - Cornerstone Bank',
  text: 'This is a test email from Cornerstone Bank',
  html: '<strong>This is a test email from Cornerstone Bank</strong><br><p>If you receive this, SendGrid is working correctly!</p>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Email sent successfully!');
  })
  .catch((error) => {
    console.error('❌ Error sending email:', error.response?.body || error.message);
  });
