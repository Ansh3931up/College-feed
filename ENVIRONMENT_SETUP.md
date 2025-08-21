# 🔧 Environment Variables Setup

This document provides detailed instructions for setting up environment variables for the College Feed Platform.

## 📁 File Location

Create a `.env` file in the `backend/` directory with the following variables:

```
backend/
├── .env          ← Create this file
├── package.json
└── src/
```

## 🔑 Required Environment Variables

### Database Configuration
```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college-feed
```

### JWT Authentication
```env
# Secret key for signing JWT tokens (use a strong, random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT token expiration time
JWT_EXPIRES_IN=7d
```

### Server Configuration
```env
# Port for the backend server
PORT=5000

# Environment mode
NODE_ENV=development

# Frontend URL for CORS policy
CORS_ORIGIN=http://localhost:3000
```

## 🤖 Optional Environment Variables

### OpenAI Configuration
```env
# OpenAI API key for smart post classification
# Get your key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Set to true to bypass OpenAI and use only fallback classification
BYPASS_OPENAI=false
```

### Cloudinary Configuration (for file uploads)
```env
# Get these from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Email Configuration (for notifications)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

## 📋 Complete .env Template

Create `backend/.env` with this template:

```env
# ================================
# COLLEGE FEED PLATFORM - ENVIRONMENT VARIABLES
# ================================

# ================================
# DATABASE CONFIGURATION
# ================================
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/college-feed

# ================================
# JWT AUTHENTICATION
# ================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# ================================
# SERVER CONFIGURATION
# ================================
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# ================================
# OPENAI CONFIGURATION (Optional)
# ================================
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
# BYPASS_OPENAI=false

# ================================
# CLOUDINARY CONFIGURATION (Optional)
# ================================
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret

# ================================
# EMAIL CONFIGURATION (Optional)
# ================================
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-gmail-app-password

# ================================
# ADDITIONAL CONFIGURATION
# ================================
# DEBUG=true
# MAX_FILE_SIZE=10MB
# ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
# RATE_LIMIT_WINDOW=15min
# RATE_LIMIT_MAX_REQUESTS=100
```

## 🔐 How to Get Each Variable

### 1. MongoDB URI
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Go to Database Access → Add Database User
4. Go to Network Access → Add IP Address (0.0.0.0/0 for development)
5. Go to Clusters → Connect → Connect your application
6. Copy the connection string and replace `<password>` with your database user password

### 2. JWT Secret
Generate a random, secure string:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any strong, random string
JWT_SECRET=myapp_super_secret_key_2024_change_in_production
```

### 3. OpenAI API Key (Optional)
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Go to API Keys section
3. Create a new secret key
4. Copy the key (starts with `sk-proj-`)

**Note**: If you don't have an OpenAI key, the system will work with fallback classification!

### 4. Cloudinary (Optional)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### 5. Gmail App Password (Optional)
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings → Security → App Passwords
3. Generate an app password for "Mail"
4. Use this password (not your regular Gmail password)

## 🚨 Security Notes

### For Development
- The provided template values are safe for local development
- Use `NODE_ENV=development`
- CORS origin should be `http://localhost:3000`

### For Production
```env
NODE_ENV=production
CORS_ORIGIN=https://your-production-domain.com
JWT_SECRET=use-a-strong-unique-secret-here
# Use production MongoDB cluster
# Add real API keys for full functionality
```

## 🔍 Testing Your Setup

### 1. Test Database Connection
```bash
cd backend
npm run dev
```
Look for: `✅ Database connected successfully`

### 2. Test OpenAI (Optional)
Try creating a post on the frontend. If OpenAI is configured correctly, you'll see intelligent classification. If not, it will use fallback classification.

### 3. Test JWT
Try registering and logging in. If JWT is configured correctly, you'll be able to authenticate.

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
❌ Error: ENOTFOUND cluster0.xxxxx.mongodb.net
```
**Fix**: Check your MONGODB_URI, ensure IP is whitelisted

### JWT Issues
```
❌ Error: jwt malformed
```
**Fix**: Clear browser localStorage and cookies, check JWT_SECRET

### OpenAI Issues
```
❌ OpenAI API quota exceeded
```
**Fix**: Add `BYPASS_OPENAI=true` to use fallback classification

### Port Issues
```
❌ Error: listen EADDRINUSE :::5000
```
**Fix**: Change PORT to 5001 or kill existing Node processes

## 📞 Support

If you encounter issues:
1. Check the console logs for specific error messages
2. Verify all required environment variables are set
3. Ensure `.env` file is in the `backend/` directory
4. Restart the server after changing environment variables

---

**✅ Once your `.env` file is properly configured, your College Feed Platform will be ready to run!**
