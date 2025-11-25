# Milestone 2 - Files Changed

This document lists all files that were created, modified, or updated during Milestone 2 implementation.

## New Files Created

### Backend Files
1. **backend/.env** - Environment variables configuration
   - Contains MongoDB connection string, port, and JWT secret
   - **Note:** This file is in `.gitignore` and should not be committed

2. **backend/.env.example** - Example environment variables template
   - Template for other developers to create their own `.env` file

### Configuration Files
3. **.gitignore** - Git ignore rules
   - Added rules for `.env` files, `node_modules/`, and other build artifacts

## Modified Files

### Frontend Files
4. **login.html**
   - Added registration form section
   - Added `data-api-base` attribute for API URL configuration
   - Added `authAlertContainer` for displaying success/error messages
   - Updated API endpoint from port 5000 to 3000
   - Added `needs-validation` class to login form
   - Added forgot password link with event handler

5. **js/main.js**
   - Added API integration functions (`sendAuthRequest`, `handleAuthSuccess`, `handleAuthError`)
   - Implemented registration form handler (`handleRegisterSubmit`)
   - Updated login form handler to use real API calls instead of alerts
   - Added token and user data storage in localStorage
   - Added loading state management (`setLoadingState`)
   - Added Bootstrap alert rendering (`renderAlert`)
   - Updated presale code handler to use Bootstrap alerts instead of native alerts
   - Added forgot password link handler
   - Consolidated all initialization into single `DOMContentLoaded` listener
   - Updated default API URL from port 5000 to 3000
   - Removed duplicate event listeners
   - Improved code organization and consistency

6. **index.html**
   - Fixed duplicate `id="about"` conflict (changed first section to `id="features"`)
   - Added "Features" link to navigation menu
   - Fixed formatting and indentation in About section

### Backend Files
7. **backend/package.json**
   - Added `jsonwebtoken` dependency
   - Added `start` and `dev` scripts for running the server

8. **backend/routes/auth.js**
   - Added JWT token generation (`createToken` function)
   - Implemented `/login` POST endpoint
   - Updated `/register` endpoint to return JWT token
   - Added user data sanitization (removed password from responses)
   - Improved error handling and validation

9. **backend/server.js**
   - Changed default port from 5000 to 3000
   - Added CORS middleware configuration
   - Added JSON body parsing middleware

### Documentation
10. **README.md**
   - Added Milestone 2 section with completed features
   - Updated project structure to include backend files
   - Added backend technologies to technologies list
   - Added prerequisites section (Node.js, MongoDB)
   - Added MongoDB installation instructions
   - Added comprehensive server startup instructions
   - Added troubleshooting section
   - Updated security features section
   - Changed status from "Milestone 1 Complete" to "Milestone 2 Complete"

## Files That Were Not Changed (But Are Used)

These files existed from Milestone 1 and are used by Milestone 2 but were not modified:

- **backend/models/User.js** - User schema (already existed)
- **css/styles.css** - Stylesheet (no changes needed)
- **index.html** - Homepage (minor fixes only)

## Summary

- **Total new files:** 2 (`.env.example`, `.gitignore` updates)
- **Total modified files:** 8 (frontend: 3, backend: 3, docs: 2)
- **Key additions:**
  - Complete authentication system (register/login)
  - Backend API server
  - Database integration
  - JWT token authentication
  - Frontend-backend integration
  - Environment configuration

## Testing Checklist

After these changes, the following should work:
- ✅ User registration with form validation
- ✅ User login with authentication
- ✅ Password hashing and secure storage
- ✅ JWT token generation and storage
- ✅ Error handling and user feedback
- ✅ Frontend-backend communication
- ✅ MongoDB data persistence

