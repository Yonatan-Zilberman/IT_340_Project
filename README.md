EventEase – Event Ticket Marketplace
Project Overview

EventEase is a full-stack event ticket marketplace enabling users to browse events, register accounts, log in, and securely manage ticket access. The platform replicates core Ticketmaster-style functionality, including user authentication, presale access, and event browsing.

Project Value

Streamlined ticket discovery and purchasing

Secure authentication system protecting user accounts

Support for presale code usage

Future support for event management, user dashboards, and digital ticketing

Milestone 1: Front-End Completion ✅

This milestone included:

Responsive homepage (index.html)

Login page (login.html) with UI validation

Clean layout for hero, features, categories, and footer

Core UI/UX foundation for authentication

Milestone 1 is fully complete.

Milestone 2: Authentication Completion (In Progress)

This milestone introduces backend integration and real user authentication.

✔ Completed So Far

Express.js backend server created

MongoDB connection established

User model created (name, email, passwordHash)

Registration route (POST /api/auth/register) implemented

Registration tested using Hoppscotch + database verification

Port and server conflicts resolved

❗ Still To Complete

Login route (POST /api/auth/login)

Frontend integration: login form sending data to backend

Dashboard page + redirect after successful login

Final testing and GitHub commit

Milestone 2 is approximately 60% complete.

Project Structure
IT_340_Project/
├── index.html                    # Homepage  
├── login.html                    # Login page  
├── css/
│   └── styles.css                # Styling  
├── js/
│   └── main.js                   # Frontend interactivity  
├── backend/                      # NEW – Backend code (Milestone 2)
│   ├── server.js                 # Express backend server  
│   ├── models/
│   │   └── User.js               # Mongoose User model  
│   ├── routes/
│   │   └── auth.js               # Authentication routes  
│   ├── package.json              # Backend dependencies  
│   └── .env                      # Environment variables (Mongo URI, Port)  
└── README.md

Technologies Used
Front-End

HTML5

CSS3 with modern responsive design

JavaScript (ES6+)

Bootstrap 5 + Bootstrap Icons

Back-End (Milestone 2)

Node.js

Express.js

MongoDB (local instance)

Mongoose (ODM)

bcryptjs (password hashing)

CORS middleware

dotenv for environment config

Features Implemented
Front-End (Milestone 1)

Responsive homepage with hero section and features

Event categories preview (concerts, sports, theater)

Login page with:

Email + password input

Password visibility toggle

Presale code field

Frontend-only validation (upgraded in Milestone 2)

Back-End (Milestone 2)

Express.js API server

MongoDB user storage

Registration endpoint with:

Duplicate account protection

Secure password hashing

Backend testable via Hoppscotch and curl

Login and full frontend integration coming next.

How to Run the Project
Front-End
cd IT_340_Project
python3 -m http.server 8000


Visit:

http://localhost:8000

Back-End
cd IT_340_Project/backend
node server.js


Visit:

http://localhost:5000/


Test in Hoppscotch:

POST http://localhost:5000/api/auth/register

Milestone Roadmap
Milestone 1 – Front-End Completion

✔ Completed

Milestone 2 – Authentication Completion

🟦 In Progress

Backend routes

Login page integration

User dashboard

Milestone 3 – Full Website Functionality

🔲

Event listings

Ticket pages

User accounts and saved events

Full feature set

Team Information

Course: IT 340
Project: EventEase – Event Ticket Marketplace
Milestone: 2 – Authentication Completion
Status: In Progress

Notes

Backend features now functional and testable.

Frontend will integrate with backend in the next step.

Project is fully responsive and works on both Windows and Linux.
