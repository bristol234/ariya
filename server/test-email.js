require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'bristolsteve8@gmail.com', // Test recipient
  from: 'cornerstonebank@accountant.com', // This needs to be verified in SendGrid
  subject: 'CFCU Banking - Test Email',
  text: 'This is a test email from CFCU Banking System',
  html: '<strong>This is a test email from CFCU Banking System</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Test email sent successfully!');
  })
  .catch((error) => {
    console.error('❌ Error sending test email:', error);
    if (error.response) {
      console.error('SendGrid Error Details:', error.response.body);
    }
  }); 