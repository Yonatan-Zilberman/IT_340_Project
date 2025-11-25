# EventEase - Event Ticket Marketplace

## Project Overview

EventEase is an e-commerce website that allows users to browse, purchase, and manage event tickets — from concerts and sports games to theater shows. The site replicates key Ticketmaster features such as presale access, exclusive code entry, and general ticket sales.

## Project Value

- **Streamlining event discovery and ticket purchasing** in one place
- **Giving fans an edge** with verified presale access
- **Providing organizers** with data-driven ticket management tools
- **Preventing fraud** through secure digital ticket verification

## Milestone 1: Front End Completion ✅

This milestone includes:
- ✅ Basic website layout with navigation, hero section, features, and footer
- ✅ Login page with form validation and presale code entry
- ✅ Responsive design that works on desktop, tablet, and mobile devices
- ✅ Modern, clean UI with ticket/event theme

## Milestone 2: Authentication Completion ✅

This milestone includes:
- ✅ Backend API server with Express.js and MongoDB
- ✅ User registration with password hashing (bcrypt)
- ✅ User login with JWT token authentication
- ✅ Frontend-backend integration for registration and login
- ✅ Secure password storage and validation
- ✅ JWT token-based session management
- ✅ CORS configuration for cross-origin requests
- ✅ Environment variable configuration (.env)

## Project Structure

```
IT_340_Project/
├── index.html              # Homepage with main layout
├── login.html              # Login and registration page
├── css/
│   └── styles.css          # Custom stylesheet
├── js/
│   └── main.js             # JavaScript for interactivity and API calls
├── backend/
│   ├── server.js           # Express.js server
│   ├── routes/
│   │   └── auth.js         # Authentication routes (register/login)
│   ├── models/
│   │   └── User.js         # MongoDB user model
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables (not in git)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **JavaScript (ES6+)** - Form handling, API integration, and interactivity
- **Bootstrap 5** - Responsive framework (via CDN)
- **Bootstrap Icons** - Icon library (via CDN)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Features Implemented

### Homepage (index.html)
- Fixed navigation bar with responsive menu
- Hero section with call-to-action buttons
- Features section highlighting key benefits
- About section with project information
- Event categories preview (Concerts, Sports, Theater)
- Footer with project information

### Login Page (login.html)
- User login form with email and password
- User registration form with name, email, and password
- Password visibility toggle
- Form validation with visual feedback
- "Remember me" checkbox
- Presale code entry section
- Forgot password link (placeholder)
- Real-time API integration with backend
- Success/error alerts using Bootstrap

### Backend API
- **POST /api/auth/register** - User registration endpoint
- **POST /api/auth/login** - User authentication endpoint
- Password hashing with bcrypt (salt rounds: 10)
- JWT token generation (1 hour expiration)
- MongoDB user data persistence
- Input validation and error handling
- CORS enabled for frontend communication

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
3. **npm** (comes with Node.js)

### Installing MongoDB on macOS

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add MongoDB tap
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

## How to Run the Application

### Step 1: Install Dependencies

Navigate to the backend directory and install Node.js packages:

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set your configuration:

```env
MONGO_URI=mongodb://localhost:27017/eventease
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Replace `JWT_SECRET` with a strong, random string for production use.

### Step 3: Start MongoDB

Make sure MongoDB is running:

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb/brew/mongodb-community
```

### Step 4: Start the Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm start
```

Or use the dev script:

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
Server listening on port 3000
```

**Keep this terminal open** - the backend server needs to keep running.

### Step 5: Start the Frontend Server

Open a **new terminal window** and navigate to the project root directory. Choose one of these options:

**Option A: Using Python 3**
```bash
cd /path/to/IT_340_Project-Milestone1
python3 -m http.server 8080
```

**Option B: Using Node.js http-server**
```bash
cd /path/to/IT_340_Project-Milestone1
npx http-server -p 8080
```

**Option C: Using PHP**
```bash
cd /path/to/IT_340_Project-Milestone1
php -S localhost:8080
```

### Step 6: Access the Application

Open your web browser and navigate to:
- **Frontend**: http://localhost:8080
- **Login Page**: http://localhost:8080/login.html
- **Backend API**: http://localhost:3000

### Step 7: Test Registration and Login

1. Go to http://localhost:8080/login.html
2. Scroll down to the "Create an Account" section
3. Fill in:
   - Full Name
   - Email Address
   - Password (minimum 8 characters)
4. Click "Sign Up" - you should see a success message
5. Use the same credentials to log in at the top of the page
6. Upon successful login, you'll be redirected to the homepage

## Troubleshooting

### MongoDB Connection Issues

**Problem:** Backend shows "MongoDB connection error"

**Solutions:**
- Verify MongoDB is running: `brew services list | grep mongodb`
- Check MongoDB is listening on port 27017: `lsof -i :27017`
- Restart MongoDB: `brew services restart mongodb/brew/mongodb-community`
- Verify `MONGO_URI` in `backend/.env` is correct

### Port Already in Use

**Problem:** "Port 3000 already in use" or "Port 8080 already in use"

**Solutions:**
- For backend: Change `PORT=3000` to another port (e.g., `PORT=3001`) in `backend/.env`
- Update `login.html` line 14: change `data-api-base="http://localhost:3000/api"` to match
- For frontend: Use a different port: `python3 -m http.server 8081`

### NetworkError / CORS Issues

**Problem:** Frontend can't connect to backend API

**Solutions:**
- Verify backend is running: `curl http://localhost:3000/`
- Check browser console (F12) for specific error messages
- Ensure API URL in `login.html` matches backend port
- Verify CORS is enabled in `backend/server.js`

### Registration/Login Not Working

**Problem:** Forms submit but nothing happens

**Solutions:**
- Open browser developer tools (F12) and check Console tab for errors
- Verify backend server is running and connected to MongoDB
- Check Network tab to see if API requests are being sent
- Verify `.env` file exists in `backend/` directory

## Stopping the Servers

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal
- **MongoDB**: `brew services stop mongodb/brew/mongodb-community`

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Security Features

- Passwords are hashed using bcrypt (salt rounds: 10)
- JWT tokens for secure authentication
- Environment variables for sensitive configuration
- CORS protection configured
- Input validation on both frontend and backend

## Future Milestones

- **Milestone 3**: Full Website Functionality
  - Complete event browsing and ticket purchasing
  - User dashboard and ticket management
  - Multi-factor authentication
  - Payment integration
  - Admin panel for event organizers

## Team Information

**Course**: IT 340  
**Project**: EventEase - Event Ticket Marketplace  
**Milestone**: 2 - Authentication Completion

## Notes

- All user passwords are securely hashed before storage
- JWT tokens expire after 1 hour for security
- The `.env` file is excluded from version control for security
- MongoDB connection string should be updated for production environments
- Frontend and backend must run on different ports to avoid conflicts

---

**Status**: Milestone 2 Complete ✅
