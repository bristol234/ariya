import sgMail from '@sendgrid/mail';

// Function to initialize SendGrid
function initializeSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  console.log('SendGrid API Key check:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');
  
  if (apiKey && apiKey.startsWith('SG.')) {
    sgMail.setApiKey(apiKey);
    console.log('SendGrid initialized successfully');
    return true;
  } else {
    console.warn('SendGrid API key not configured properly. Email functionality will be disabled.');
    return false;
  }
}

// Initialize SendGrid
const sendGridInitialized = initializeSendGrid();

export class EmailService {
  static async sendOTP(email: string, username: string, otp: string): Promise<boolean> {
    try {
      // Re-initialize SendGrid in case environment variables were loaded after import
      if (!sendGridInitialized) {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (apiKey && apiKey.startsWith('SG.')) {
          sgMail.setApiKey(apiKey);
          console.log('SendGrid re-initialized successfully');
        } else {
          console.error('SendGrid API key still not available');
          console.log(`[DEV] OTP for ${email} (user: ${username}) is: ${otp}`);
          return false;
        }
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Login Code - Cornerstone Bank</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f8fafc;
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
                .header h1 {
                    font-size: 28px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .header p {
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 40px;
                }
                .welcome-text {
                    font-size: 18px;
                    color: #374151;
                    margin-bottom: 24px;
                }
                .otp-container {
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                    border: 2px solid #e5e7eb;
                }
                .otp-label {
                    font-size: 14px;
                    color: #6b7280;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                }
                .otp-code {
                    font-size: 36px;
                    font-weight: 700;
                    color: #1f2937;
                    letter-spacing: 4px;
                    font-family: 'Courier New', monospace;
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    border: 2px dashed #d1d5db;
                    display: inline-block;
                    min-width: 200px;
                }
                .instructions {
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 20px;
                    margin: 24px 0;
                    border-radius: 0 8px 8px 0;
                }
                .instructions h3 {
                    color: #92400e;
                    font-size: 16px;
                    margin-bottom: 8px;
                }
                .instructions ul {
                    color: #92400e;
                    padding-left: 20px;
                }
                .instructions li {
                    margin-bottom: 4px;
                }
                .footer {
                    background-color: #f9fafb;
                    padding: 30px 40px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }
                .footer p {
                    color: #6b7280;
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                .security-note {
                    background-color: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 24px;
                }
                .security-note p {
                    color: #991b1b;
                    font-size: 14px;
                    text-align: center;
                }
                .logo {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 10px;
                        border-radius: 8px;
                    }
                    .header, .content, .footer {
                        padding: 20px;
                    }
                    .otp-code {
                        font-size: 28px;
                        letter-spacing: 2px;
                        min-width: 160px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏦 Cornerstone Bank</div>
                    <h1>Your Login Code</h1>
                    <p>Secure access to your account</p>
                </div>
                
                <div class="content">
                    <p class="welcome-text">Hello <strong>${username}</strong>,</p>
                    
                    <p>We received a request to access your Cornerstone Bank account. To complete your login, please use the verification code below:</p>
                    
                    <div class="otp-container">
                        <div class="otp-label">Verification Code</div>
                        <div class="otp-code">${otp}</div>
                    </div>
                    
                    <div class="instructions">
                        <h3>🔐 Security Instructions:</h3>
                        <ul>
                            <li>This code will expire in 10 minutes</li>
                            <li>Never share this code with anyone</li>
                            <li>If you didn't request this code, please contact us immediately</li>
                        </ul>
                    </div>
                    
                    <p>Enter this code on the login page to access your account securely.</p>
                    
                    <div class="security-note">
                        <p><strong>⚠️ Security Notice:</strong> Cornerstone Bank will never ask for this code via phone, email, or text message.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>Cornerstone Bank</strong></p>
                    <p>Your trusted financial partner</p>
                    <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                        This is an automated message. Please do not reply to this email.<br>
                        For support, contact us at support@cornerstonebank.com
                    </p>
                </div>
            </div>
        </body>
        </html>
      `;

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: 'Your Cornerstone Bank Login Code',
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`OTP email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      // Log OTP so devs can proceed during email issues
      console.log(`[DEV] OTP for ${email} (user: ${username}) is: ${otp}`);
      // Do not throw; return false to let caller proceed gracefully
      return false;
    }
  }

  static async sendTransactionNotification(email: string, transaction: any, username: string) {
    // Check if SendGrid is properly configured
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.log(`Transaction notification would be sent to ${email} for transaction ${transaction.transactionId}`);
      return true;
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `Transaction ${transaction.status} - CFCU Bank`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #002C5F 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">CFCU Bank</h1>
            <p style="color: #e5e7eb; margin: 10px 0 0 0;">Transaction Notification</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Transaction Update</h2>
            
            <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">
              Hello ${username},
            </p>
            
            <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">
              Your transaction has been updated:
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${transaction.type}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> $${transaction.amount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #059669;">${transaction.status}</span></p>
              <p style="margin: 5px 0;"><strong>Description:</strong> ${transaction.description}</p>
            </div>
            
            <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px;">
              Thank you for banking with CFCU Bank.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 CFCU Bank. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`Transaction notification sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending transaction notification:', error);
      // Don't throw error, just log it and return false
      return false;
    }
  }
}
