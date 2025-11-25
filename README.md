EventEase - Event Ticket Marketplace
Project Overview

EventEase is an e-commerce website that allows users to browse, purchase, and manage event tickets — from concerts and sports games to theater shows. The site replicates key Ticketmaster features such as presale access, exclusive code entry, and general ticket sales.

Project Value

Streamlining event discovery and ticket purchasing in one place

Giving fans an edge with verified presale access

Providing organizers with data-driven ticket management tools

Preventing fraud through secure digital ticket verification

Milestone 1: Front End Completion

This milestone includes:

✅ Basic website layout with navigation, hero section, features, and footer

✅ Login page with form validation and presale code entry

✅ Responsive design that works on desktop, tablet, and mobile devices

✅ Modern, clean UI with ticket/event theme

Milestone 2: Authentication Completion (In Progress)

This milestone includes:

✅ Backend server setup using Node.js and Express

✅ MongoDB connection established with Mongoose

✅ Environment variables configured using .env

✅ User model created (name, email, passwordHash)

✅ Registration route (POST /api/auth/register) implemented

✅ Password hashing using bcrypt

✅ Registration tested successfully using Hoppscotch (users stored in MongoDB)

❌ Login route (POST /api/auth/login)

❌ Login page connected to backend

❌ Dashboard page + redirect after login

Project Structure
IT_340_Project/
├── index.html              # Homepage with main layout
├── login.html              # Login page
├── css/
│   └── styles.css          # Custom stylesheet
├── js/
│   └── main.js             # JavaScript for interactivity
├── assets/
│   └── images/             # Image assets (placeholder)
└── backend/                # Backend for Milestone 2
    ├── server.js           # Express backend server
    ├── routes/
    │   └── auth.js         # Authentication routes
    ├── models/
    │   └── User.js         # User schema
    └── package.json        # Backend dependencies
    Technologies Used

HTML5 - Semantic markup

CSS3 - Custom styling with CSS variables

JavaScript (ES6+) - Form handling and interactivity

Bootstrap 5 - Responsive framework (via CDN)

Bootstrap Icons - Icon library (via CDN)

Features Implemented
Homepage (index.html)

Fixed navigation bar with responsive menu

Hero section with call-to-action buttons

Features section highlighting key benefits

Event categories preview (Concerts, Sports, Theater)

Footer with project information

Login Page (login.html)

User-friendly login form with email and password

Password visibility toggle

Form validation with visual feedback

"Remember me" checkbox

Presale code entry section

Link to registration (placeholder for future)

Cross-Platform Compatibility

This project is designed to work on both Windows and Linux systems. All dependencies are loaded via CDN, so no local installation is required. Simply open the HTML files in a web browser.

How to Run

Open the project folder in your file system

Open index.html in any modern web browser (Chrome, Firefox, Edge, Safari)

Navigate to the login page by clicking the "Login" button in the navigation

Local Development Server (Optional)

For a better development experience, you can use a local server:

Python 3:

python -m http.server 8000


Node.js (with http-server):

npx http-server -p 8000


Then open http://localhost:8000 in your browser.

Browser Compatibility

Chrome (latest)

Firefox (latest)

Edge (latest)

Safari (latest)

Future Milestones

Milestone 2: Authentication Completion

Milestone 3: Full Website Functionality

Team Information

Course: IT 340
Project: EventEase - Event Ticket Marketplace
Milestone: 2 - Authentication Completion

Notes

All forms currently show alerts for demonstration purposes

Backend authentication (registration) now implemented

Login and dashboard functionality will be completed next

The design is fully responsive and mobile-friendly

All styling uses modern CSS with smooth transitions and animations

Status: Milestone 2 In Progress 🔄
