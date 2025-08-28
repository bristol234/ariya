// Production email service using SendGrid
import sgMail from '@sendgrid/mail';
import { OTP } from '../models/OTP';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Email configuration
const emailConfig = {
  from: process.env.FROM_EMAIL || 'cornerstonebank@accountant.com'
};

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WireTransferNotificationData {
  transferId: string;
  recipientName: string;
  recipientBank: string;
  amount: number;
  status: 'processing' | 'completed' | 'failed' | 'on_hold';
  adminNotes?: string;
  estimatedProcessingTime?: string;
}

interface OTPData {
  username: string;
  email: string;
  otp: string;
  expiresAt: string;
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email: string, username: string, otp: string): Promise<boolean> => {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Delete any existing OTP for this user
    await OTP.deleteMany({ email, username });
    
    // Store OTP in database
    await OTP.create({
      email,
      username,
      otp,
      expiresAt
    });

    // Send email using SendGrid
    const msg = {
      to: email,
      from: emailConfig.from,
      subject: 'CFCU Banking - Your Login Verification Code',
      html: generateOTPEmailHTML(username, otp),
      text: generateOTPEmailText(username, otp)
    };

    await sgMail.send(msg);
    console.log('📧 OTP Email sent to:', email);

    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
};

export const verifyOTP = async (email: string, username: string, otp: string): Promise<boolean> => {
  try {
    const otpRecord = await OTP.findOne({ email, username, isUsed: false });
    
    if (!otpRecord) {
      return false;
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return false;
    }

    // Verify OTP
    if (otpRecord.code === otp) {
      otpRecord.isUsed = true;
      await otpRecord.save();
      return true;
    }

    return false;
  } catch (error) {
    console.error('OTP verification error:', error);
    return false;
  }
};

// Email template functions
const generateOTPEmailHTML = (username: string, otp: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CFCU Banking - Verification Code</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #374151;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #002C5F 0%, #1e40af 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .bank-logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 32px;
            font-weight: 700;
            color: #002C5F;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .content {
            padding: 40px 30px;
        }
        .otp-code {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border: 3px solid #002C5F;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 6px;
            color: #002C5F;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            background: #002C5F;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="bank-logo">C</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Cornerstone Financial</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Credit Union</p>
        </div>
        
        <div class="content">
            <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">🔐 Your Login Verification Code</h2>
            
            <p style="font-size: 16px; color: #4b5563;">Hello <strong>${username}</strong>,</p>
            
            <p style="font-size: 16px; color: #4b5563;">We received a request to log in to your CFCU Banking account. To ensure your security, please use the verification code below:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="security-note">
                <strong>⚠️ Security Notice:</strong> This code will expire in 10 minutes for your protection.
            </div>
            
            <p style="font-size: 16px; color: #4b5563;"><strong>Important:</strong> If you didn't request this code, please:</p>
            <ul style="font-size: 16px; color: #4b5563;">
                <li>Ignore this email</li>
                <li>Contact our security team immediately at 1-800-CFCU-HELP</li>
                <li>Change your password if you suspect unauthorized access</li>
            </ul>
            
            <p style="font-size: 16px; color: #4b5563;">Thank you for choosing Cornerstone Financial Credit Union for your banking needs.</p>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Cornerstone Financial Credit Union</strong></p>
            <p style="margin: 0 0 10px 0;">📍 123 Banking Street, Nashville, TN 37201</p>
            <p style="margin: 0 0 10px 0;">📞 1-800-CFCU-HELP | 📧 support@cfcu.org</p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an automated security message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
};

const generateOTPEmailText = (username: string, otp: string): string => {
  return `
CFCU Banking - Your Login Verification Code

Hello ${username},

We received a request to log in to your CFCU Banking account. Use the verification code below to complete your login:

${otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email or contact our support team immediately.

This is an automated message from Cornerstone Financial Credit Union.
Please do not reply to this email. For assistance, contact us at 1-800-CFCU-HELP.`;
};

export const sendWireTransferNotification = async (
  userEmail: string,
  data: WireTransferNotificationData
): Promise<boolean> => {
  try {
    const subject = `Wire Transfer ${data.status.toUpperCase()} - ${data.transferId}`;
    
    const html = generateWireTransferEmailHTML(data);
    const text = generateWireTransferEmailText(data);
    
    const msg = {
      to: userEmail,
      from: emailConfig.from,
      subject,
      html,
      text
    };
    
    await sgMail.send(msg);
    console.log('📧 Wire transfer notification sent:', {
      to: userEmail,
      subject,
      transferId: data.transferId,
      status: data.status
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send wire transfer notification:', error);
    return false;
  }
};

const generateWireTransferEmailHTML = (data: WireTransferNotificationData): string => {
  const statusColors = {
    processing: '#f59e0b',
    completed: '#10b981',
    failed: '#ef4444',
    on_hold: '#6b7280'
  };
  
  const statusMessages = {
    processing: 'Your wire transfer is being processed',
    completed: 'Your wire transfer has been completed successfully',
    failed: 'Your wire transfer has failed',
    on_hold: 'Your wire transfer has been placed on hold'
  };
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wire Transfer ${data.status.toUpperCase()}</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #374151;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #002C5F 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .bank-logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            font-size: 24px;
            font-weight: 700;
            color: #002C5F;
        }
        .content {
            background: white;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }
        .status-badge {
            display: inline-block;
            background: ${statusColors[data.status]};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .details {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #6b7280;
        }
        .value {
            font-weight: 600;
            color: #111827;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
        .admin-notes {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .admin-notes h4 {
            margin: 0 0 10px 0;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="bank-logo">C</div>
        <h1 style="margin: 0; font-size: 24px;">Cornerstone Financial</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Credit Union</p>
    </div>
    
    <div class="content">
        <div class="status-badge">${data.status.toUpperCase()}</div>
        
        <h2 style="margin: 0 0 20px 0; color: #111827;">${statusMessages[data.status]}</h2>
        
        <div class="details">
            <div class="detail-row">
                <span class="label">Transfer ID:</span>
                <span class="value">${data.transferId}</span>
            </div>
            <div class="detail-row">
                <span class="label">Recipient:</span>
                <span class="value">${data.recipientName}</span>
            </div>
            <div class="detail-row">
                <span class="label">Bank:</span>
                <span class="value">${data.recipientBank}</span>
            </div>
            <div class="detail-row">
                <span class="label">Amount:</span>
                <span class="value">$${data.amount.toFixed(2)}</span>
            </div>
            ${data.estimatedProcessingTime ? `
            <div class="detail-row">
                <span class="label">Processing Time:</span>
                <span class="value">${data.estimatedProcessingTime}</span>
            </div>
            ` : ''}
        </div>
        
        ${data.adminNotes ? `
        <div class="admin-notes">
            <h4>Admin Notes:</h4>
            <p style="margin: 0; color: #92400e;">${data.adminNotes}</p>
        </div>
        ` : ''}
        
        <p style="margin: 20px 0; color: #6b7280;">
            If you have any questions about this wire transfer, please contact our customer service team 
            at 1-800-CFCU-HELP or visit your nearest branch.
        </p>
        
        <div class="footer">
            <p>This is an automated notification from Cornerstone Financial Credit Union.</p>
            <p>Please do not reply to this email. For assistance, contact us directly.</p>
        </div>
    </div>
</body>
</html>`;
};

const generateWireTransferEmailText = (data: WireTransferNotificationData): string => {
  const statusMessages = {
    processing: 'Your wire transfer is being processed',
    completed: 'Your wire transfer has been completed successfully',
    failed: 'Your wire transfer has failed',
    on_hold: 'Your wire transfer has been placed on hold'
  };
  
  return `
Wire Transfer ${data.status.toUpperCase()} - ${data.transferId}

${statusMessages[data.status]}

Transfer Details:
- Transfer ID: ${data.transferId}
- Recipient: ${data.recipientName}
- Bank: ${data.recipientBank}
- Amount: $${data.amount.toFixed(2)}
${data.estimatedProcessingTime ? `- Processing Time: ${data.estimatedProcessingTime}` : ''}

${data.adminNotes ? `Admin Notes: ${data.adminNotes}` : ''}

If you have any questions about this wire transfer, please contact our customer service team at 1-800-CFCU-HELP or visit your nearest branch.

This is an automated notification from Cornerstone Financial Credit Union.
Please do not reply to this email. For assistance, contact us directly.
`;
}; 