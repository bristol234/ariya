import nodemailer from 'nodemailer';

// Gmail email service
export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    return this.transporter;
  }

  static async sendOTP(email: string, username: string, otp: string): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'CFCU Banking - You Are Almost There!',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CFCU Banking - Verification</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f8f9fa;
                margin: 0;
                padding: 20px;
              }
              
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              }
              
              .header {
                padding: 40px 30px 30px;
                text-align: center;
                background: #ffffff;
                border-bottom: 1px solid #f0f0f0;
              }
              
              .logo {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #002C5F 0%, #1e40af 100%);
                border-radius: 12px;
                margin-bottom: 20px;
                font-size: 24px;
                font-weight: 800;
                color: #ffffff;
                box-shadow: 0 4px 12px rgba(0, 44, 95, 0.2);
              }
              
              .bank-name {
                font-size: 28px;
                font-weight: 700;
                color: #002C5F;
                margin-bottom: 8px;
              }
              
              .bank-subtitle {
                font-size: 16px;
                color: #6b7280;
                font-weight: 500;
              }
              
              .content {
                padding: 40px 30px;
                background: #ffffff;
              }
              
              .main-title {
                font-size: 32px;
                font-weight: 700;
                color: #1f2937;
                text-align: center;
                margin-bottom: 20px;
                line-height: 1.2;
              }
              
              .intro-text {
                font-size: 16px;
                color: #6b7280;
                text-align: center;
                margin-bottom: 40px;
                line-height: 1.6;
              }
              
              .verification-section {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 2px solid #0ea5e9;
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
                position: relative;
              }
              
              .verification-label {
                font-size: 14px;
                font-weight: 600;
                color: #0c4a6e;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
                opacity: 0.8;
              }
              
              .verification-code {
                font-size: 64px;
                font-weight: 800;
                color: #0c4a6e;
                letter-spacing: 12px;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                margin: 30px 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                line-height: 1;
              }
              
              .expiry-text {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
                margin-top: 15px;
              }
              
              .cta-section {
                text-align: center;
                margin: 40px 0 30px;
              }
              
              .cta-text {
                font-size: 16px;
                font-weight: 600;
                color: #374151;
                margin-bottom: 20px;
              }
              
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #002C5F 0%, #1e40af 100%);
                color: #ffffff;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 12px;
                font-weight: 700;
                font-size: 16px;
                box-shadow: 0 8px 20px rgba(0, 44, 95, 0.25);
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
              }
              
              .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 25px rgba(0, 44, 95, 0.35);
              }
              
              .security-note {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
                text-align: center;
              }
              
              .security-note p {
                color: #92400e;
                font-size: 14px;
                font-weight: 500;
                margin: 0;
              }
              
              .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
              }
              
              .support-link {
                margin-bottom: 25px;
              }
              
              .support-link a {
                color: #002C5F;
                text-decoration: underline;
                font-weight: 600;
              }
              
              .footer-logo {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #002C5F 0%, #1e40af 100%);
                border-radius: 10px;
                margin-bottom: 15px;
                font-size: 20px;
                font-weight: 800;
                color: #ffffff;
              }
              
              .footer-info {
                color: #6b7280;
                font-size: 14px;
                line-height: 1.5;
              }
              
              .footer-info p {
                margin-bottom: 5px;
              }
              
              @media (max-width: 600px) {
                body {
                  padding: 10px;
                }
                
                .email-container {
                  border-radius: 8px;
                }
                
                .header {
                  padding: 30px 20px 20px;
                }
                
                .content {
                  padding: 30px 20px;
                }
                
                .main-title {
                  font-size: 28px;
                }
                
                .verification-code {
                  font-size: 48px;
                  letter-spacing: 8px;
                  margin: 25px 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <div class="logo">C</div>
                <div class="bank-name">CFCU</div>
                <div class="bank-subtitle">Cornerstone Financial Credit Union</div>
              </div>
              
              <div class="content">
                <h1 class="main-title">You Are Almost There!</h1>
                
                <p class="intro-text">
                  Only one step left to access your CFCU Banking account. Please enter this verification code in the window where you started your login process.
                </p>
                
                <div class="verification-section">
                  <div class="verification-label">Verification Code</div>
                  <div class="verification-code">${otp}</div>
                  <div class="expiry-text">This code is valid for the next 10 minutes.</div>
                </div>
                
                <div class="cta-section">
                  <p class="cta-text">Or click on the button below to access your account</p>
                  <a href="https://cornerstonefcu.web.app" class="cta-button">
                    Access CFCU Banking
                  </a>
                </div>
                
                <div class="security-note">
                  <p>🔒 Never share this code with anyone. CFCU will never ask for this code via phone or email.</p>
                </div>
              </div>
              
              <div class="footer">
                <div class="support-link">
                  <p>Have a question or trouble logging in? Please contact us <a href="mailto:support@cfcu.org">here</a>.</p>
                </div>
                
                <div class="footer-logo">C</div>
                
                <div class="footer-info">
                  <p><strong>Cornerstone Financial Credit Union</strong></p>
                  <p>123 Banking Street, Nashville, TN 37201</p>
                  <p>Call us - 1-800-CFCU-HELP</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      console.log(`📧 [DEV] OTP for ${email} (user: ${username}) is: ${otp}`);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, username: string, firstName: string): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Welcome to CFCU Banking!',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to CFCU</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 30px 40px;
                text-align: center;
              }
              .content {
                padding: 40px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                background-color: #f8fafc;
                padding: 20px 40px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to CFCU Banking!</h1>
              </div>
              
              <div class="content">
                <h2>Hello ${firstName}!</h2>
                <p>Welcome to Cornerstone Financial Credit Union! Your account has been successfully created.</p>
                <p>You can now access your banking services with username: <strong>${username}</strong></p>
                
                <a href="https://cornerstonefcu.web.app" class="button">Start Banking</a>
              </div>
              
              <div class="footer">
                <p>&copy; 2024 Cornerstone Financial Credit Union. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return false;
    }
  }

  static async sendTransactionNotification(email: string, username: string, transactionDetails: any): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'CFCU - Transaction Notification',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Notification</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 30px 40px;
                text-align: center;
              }
              .content {
                padding: 40px;
              }
              .transaction-details {
                background: #f3f4f6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .footer {
                background-color: #f8fafc;
                padding: 20px 40px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Transaction Notification</h1>
              </div>
              
              <div class="content">
                <h2>Hello ${username},</h2>
                <p>A transaction has been processed on your account:</p>
                
                <div class="transaction-details">
                  <p><strong>Type:</strong> ${transactionDetails.type}</p>
                  <p><strong>Amount:</strong> $${transactionDetails.amount}</p>
                  <p><strong>Status:</strong> ${transactionDetails.status}</p>
                  <p><strong>Date:</strong> ${new Date(transactionDetails.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div class="footer">
                <p>&copy; 2024 Cornerstone Financial Credit Union. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Transaction notification sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending transaction notification:', error);
      return false;
    }
  }
}
