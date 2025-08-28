# CFCU Banking System - Production Ready

A modern, secure online banking system built with React, Node.js, TypeScript, and MongoDB Atlas.

## 🚀 Features

- **Secure Authentication**: OTP-based email verification for users, direct login for admins
- **Real Banking Features**: Account management, transfers, wire transfers, admin approval system
- **Production Ready**: MongoDB Atlas, Nodemailer, JWT authentication, rate limiting
- **Modern UI**: Responsive design with Tailwind CSS, bank-style interface
- **Admin Panel**: Transaction approval, user management, system monitoring

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form handling
- Axios for API communication
- Lucide React for icons

### Backend
- Node.js with TypeScript
- Express.js framework
- MongoDB Atlas database
- Mongoose ODM
- JWT authentication
- Nodemailer for email services
- bcryptjs for password hashing
- Rate limiting and security headers

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Email service (Gmail, SendGrid, etc.)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd cfcuorg
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Environment Configuration

#### Backend (.env file in server directory)

```bash
# Server Configuration
PORT=5002
NODE_ENV=production

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/cfcu-banking?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
CORS_ORIGIN=http://localhost:3000,https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Banking Configuration
BANK_ROUTING_NUMBER=264080811
BANK_NAME=Cornerstone Financial Credit Union
BANK_PHONE=1-800-CFCU-HELP
```

#### Frontend (.env file in client directory)

```bash
REACT_APP_API_URL=http://localhost:5002/api
```

### 3. Database Setup

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Update the `MONGODB_URI` in your `.env` file

### 4. Email Setup

#### Gmail Setup:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

#### SendGrid Setup:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### 5. Create Users and Accounts

Run the user creation script:

```bash
cd server
node scripts/createUser.js
```

This will create:
- **demo** user (password: `password`)
- **vincent4u** user (password: `Grant@gabby123`)
- **admin** user (password: `password`)

Each user will get unique 9-digit account numbers automatically generated.

### 6. Start the Application

#### Development Mode:
```bash
# From root directory
npm run dev
```

#### Production Mode:
```bash
# Backend
cd server
npm run build
npm start

# Frontend
cd client
npm run build
npm start
```

## 🔐 Authentication Flow

### Regular Users:
1. Enter username and password
2. Receive 6-digit OTP via email
3. Enter OTP on verification page
4. Access granted to dashboard

### Admin Users:
1. Enter username and password
2. Direct access to admin panel (no OTP required)

## 📊 Account Management

- **9-digit account numbers** automatically generated
- **Multiple account types**: Checking, Savings, Credit
- **Real-time balance updates**
- **Transaction history with status tracking**

## 💸 Transfer System

### Internal Transfers:
- Instant processing
- Real-time balance updates
- No admin approval required

### External Transfers:
- Zelle, ACH, Wire transfers
- Admin approval required
- Email notifications
- Receipt generation

### Wire Transfers:
- Processing status with estimated time
- Admin approval workflow
- Detailed receipt with bank branding
- Email notifications for status updates

## 👨‍💼 Admin Panel

- **Transaction Approval**: Review and approve pending transfers
- **User Management**: View user accounts and transactions
- **System Monitoring**: Dashboard with key metrics
- **Status Management**: Update transaction statuses

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- OTP expiration (10 minutes)
- Maximum OTP attempts (5)

## 📁 Project Structure

```
cfcuorg/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── middleware/    # Custom middleware
│   └── scripts/           # Database scripts
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Heroku/Netlify):
1. Set environment variables
2. Deploy to your preferred platform
3. Update CORS origins

### Frontend Deployment (Vercel/Netlify):
1. Set `REACT_APP_API_URL` to your backend URL
2. Deploy to your preferred platform

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**:
   - Check your connection string
   - Ensure IP whitelist includes your IP
   - Verify username/password

2. **Email Not Sending**:
   - Check SMTP credentials
   - Verify email service settings
   - Check firewall/network restrictions

3. **OTP Not Working**:
   - Check email configuration
   - Verify OTP expiration time
   - Check database connection

## 📞 Support

For technical support or questions:
- Email: support@cfcu.org
- Phone: 1-800-CFCU-HELP

## 📄 License

This project is proprietary software for Cornerstone Financial Credit Union.

---

**Note**: This is a production-ready banking system. Ensure all security measures are properly configured before deployment to production. 