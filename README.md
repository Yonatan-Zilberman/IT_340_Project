# EventEase - Event Ticket Marketplace

## Description

EventEase is a full-stack MEAN (MongoDB, Express.js, AngularJS/React, Node.js) web application that provides a comprehensive platform for buying and selling event tickets. The platform enables users to browse concerts, sports events, and theater shows, purchase tickets securely, manage their orders, and even list their own tickets for sale. Built with modern web technologies and deployed across a distributed 4-VM architecture, EventEase offers a secure, scalable, and user-friendly ticket marketplace experience.

## Project Overview

EventEase is an e-commerce website that allows users to browse, purchase, and manage event tickets — from concerts and sports games to theater shows. The platform replicates key Ticketmaster features such as presale access, exclusive code entry, and general ticket sales, while also providing a peer-to-peer ticket resale marketplace.

The application is built using the MEAN stack and deployed across four separate virtual machines (VMs) for enhanced security, scalability, and network isolation. Each VM handles a specific layer of the application stack, with strict firewall rules ensuring that only authorized traffic flows between components.

## Project Value

- **Streamlining event discovery and ticket purchasing** in one place, making it easy for users to find and buy tickets for their favorite events
- **Giving fans an edge** with verified presale access and exclusive ticket codes
- **Providing organizers** with data-driven ticket management tools and analytics
- **Preventing fraud** through secure digital ticket verification and two-factor authentication (2FA)
- **Enabling peer-to-peer resale** allowing users to buy and sell tickets in a secure marketplace
- **Scalable architecture** with distributed VM deployment for improved performance and security
- **Network security** through strict firewall rules and private VLAN isolation

## Project Structure

```
IT_340_Project-Milestone3/
├── index.html                  # Homepage with featured events
├── login.html                  # User authentication page with 2FA
├── dashboard.html              # User dashboard with orders and listings
├── events.html                 # Browse all events page
├── event-detail.html          # Individual event details and ticket purchase
├── css/
│   └── styles.css             # Custom stylesheet with responsive design
├── js/
│   ├── config.js              # Frontend configuration and API endpoints
│   ├── main.js                # Main application orchestrator
│   ├── auth.js                # Authentication module
│   ├── events.js              # Events display module
│   ├── utils.js               # Utility functions and navigation
│   └── services/
│       ├── apiService.js      # Base API service for HTTP requests
│       ├── authService.js     # Authentication service
│       ├── eventService.js     # Event-related API calls
│       └── ticketService.js   # Ticket-related API calls
├── backend/
│   ├── server.js              # Express.js server entry point
│   ├── package.json           # Node.js dependencies
│   ├── config/
│   │   └── env.js             # Environment variable validation
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic (register, login, 2FA)
│   │   ├── eventController.js # Event CRUD operations
│   │   ├── ticketController.js # Ticket CRUD operations
│   │   ├── orderController.js  # Order management
│   │   └── userController.js   # User profile management
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Event.js           # Event schema
│   │   ├── Ticket.js           # Ticket schema
│   │   ├── Order.js            # Order schema
│   │   └── OTP.js              # OTP schema for 2FA
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication routes
│   │   ├── eventRoutes.js      # Event routes
│   │   ├── ticketRoutes.js    # Ticket routes
│   │   ├── orderRoutes.js     # Order routes
│   │   ├── userRoutes.js       # User routes
│   │   └── frontendLog.js      # Frontend logging endpoint
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT authentication middleware
│   │   ├── errorHandler.js     # Centralized error handling
│   │   ├── rateLimiter.js      # Rate limiting for OTP requests
│   │   └── validator.js        # Request validation helpers
│   ├── utils/
│   │   ├── jwtUtils.js         # JWT token generation/verification
│   │   ├── otpUtils.js          # OTP generation utilities
│   │   └── constants.js         # Application constants
│   ├── scripts/
│   │   └── seedDatabase.js     # Database seeding script
│   └── logs/                   # Application logs (gitignored)
├── setup-prerequisites.sh      # Initial setup script (run first on all VMs)
├── setup-frontend.sh           # Frontend VM setup script
├── setup-node.sh               # Node.js VM setup script
├── setup-express.sh            # Express backend VM setup script
├── setup-db.sh                 # MongoDB VM setup script
├── start-local.sh              # Local development setup script
└── README.md                   # This file
```

## Technologies Used

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Custom styling with CSS variables, gradients, and animations
- **JavaScript (ES6+)** - Modern JavaScript with modules and async/await
- **Bootstrap 5** - Responsive framework and UI components (via CDN)
- **Bootstrap Icons** - Icon library (via CDN)

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose 9.0.0** - MongoDB object modeling
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **bcryptjs 3.0.3** - Password hashing
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 17.2.3** - Environment variable management
- **morgan 1.10.1** - HTTP request logger

### Infrastructure & Deployment
- **Ubuntu** - Linux operating system for VMs
- **Nginx** - Web server for frontend
- **PM2** - Process manager for Node.js applications
- **UFW (Uncomplicated Firewall)** - Firewall configuration
- **VMware Fusion** - Virtualization platform

## Features Implemented

### User Authentication
- User registration with email and password
- Secure login with password hashing
- Two-factor authentication (2FA) with OTP codes
- JWT-based session management
- Password visibility toggle
- Rate limiting for OTP requests

### Event Management
- Browse all available events
- View featured events on homepage
- Filter events by category (Concerts, Sports, Theater)
- View detailed event information
- Dynamic event loading from database

### Ticket Management
- View available tickets for events
- Purchase tickets (creates orders automatically)
- List tickets for sale
- View ticket details (section, row, seat, price)

### Order Management
- View purchase history
- Order details with event information
- Order status tracking
- Total spending statistics

### User Dashboard
- Personalized welcome message
- Statistics (tickets purchased, total spent, active listings)
- Recent orders display
- Active ticket listings
- Featured events section

## How to Run on 4 VMs

This section provides step-by-step instructions for deploying EventEase across four separate virtual machines. Each VM handles a specific component of the MEAN stack.

### Prerequisites

- Four Ubuntu VMs (base Ubuntu on VMware Fusion)
- All VMs connected to a private VLAN
- Full codebase downloaded on each VM
- Internet connection for initial setup (for installing prerequisites)

### Step 1: Configure IP Addresses

**IMPORTANT:** Before running any setup scripts, you must configure the IP addresses in each script to match your VLAN setup.

1. **Determine your VM IP addresses** - Each VM should have a static IP on your private VLAN. For example:
   - Frontend VM: `192.168.1.10`
   - Node.js VM: `192.168.1.20`
   - Express VM: `192.168.1.30`
   - MongoDB VM: `192.168.1.40`

2. **Edit the IP addresses in each setup script:**

   **In `setup-frontend.sh` (lines 9-12):**
   ```bash
   FRONTEND_IP="192.168.1.10"  # Change to your Frontend VM IP
   NODE_IP="192.168.1.20"      # Change to your Node.js VM IP
   EXPRESS_IP="192.168.1.30"   # Change to your Express VM IP
   MONGODB_IP="192.168.1.40"   # Change to your MongoDB VM IP
   ```

   **In `setup-node.sh` (lines 9-12):**
   ```bash
   FRONTEND_IP="192.168.1.10"  # Change to your Frontend VM IP
   NODE_IP="192.168.1.20"      # Change to your Node.js VM IP
   EXPRESS_IP="192.168.1.30"   # Change to your Express VM IP
   MONGODB_IP="192.168.1.40"   # Change to your MongoDB VM IP
   ```

   **In `setup-express.sh` (lines 9-12):**
   ```bash
   FRONTEND_IP="192.168.1.10"  # Change to your Frontend VM IP
   NODE_IP="192.168.1.20"      # Change to your Node.js VM IP
   EXPRESS_IP="192.168.1.30"   # Change to your Express VM IP
   MONGODB_IP="192.168.1.40"   # Change to your MongoDB VM IP
   ```

   **In `setup-db.sh` (lines 9-12):**
   ```bash
   FRONTEND_IP="192.168.1.10"  # Change to your Frontend VM IP
   NODE_IP="192.168.1.20"      # Change to your Node.js VM IP
   EXPRESS_IP="192.168.1.30"   # Change to your Express VM IP
   MONGODB_IP="192.168.1.40"   # Change to your MongoDB VM IP
   ```

3. **Update MongoDB connection in `setup-express.sh`:** The script automatically creates a `.env` file with the MongoDB connection string. Make sure the `MONGODB_IP` variable matches your MongoDB VM IP.

### Step 2: Run Prerequisites Script (All VMs)

**On EACH of the 4 VMs**, while still connected to the internet:

1. Navigate to the project directory:
   ```bash
   cd /path/to/IT_340_Project-Milestone3
   ```

2. Make the script executable (if not already):
   ```bash
   chmod +x setup-prerequisites.sh
   ```

3. Run the prerequisites script with sudo:
   ```bash
   sudo ./setup-prerequisites.sh
   ```

   This will install:
   - Node.js and npm
   - Python 3
   - PM2 process manager
   - UFW firewall
   - Nginx
   - MongoDB

   **Wait for this to complete on all VMs before proceeding.**

### Step 3: Setup MongoDB VM

**On the MongoDB VM:**

1. Navigate to the project directory:
   ```bash
   cd /path/to/IT_340_Project-Milestone3
   ```

2. Make the script executable:
   ```bash
   chmod +x setup-db.sh
   ```

3. Run the setup script with sudo:
   ```bash
   sudo ./setup-db.sh
   ```

   This will:
   - Configure MongoDB to bind to the private VLAN IP
   - Create admin and application database users
   - Enable authentication
   - Configure UFW firewall (allows port 27017 only from Express VM)
   - Start MongoDB service
   - Set up log monitoring

4. **Note the MongoDB connection string** displayed at the end (you'll need this for the Express VM).

### Step 4: Setup Express VM

**On the Express VM:**

1. Navigate to the project directory:
   ```bash
   cd /path/to/IT_340_Project-Milestone3
   ```

2. Make the script executable:
   ```bash
   chmod +x setup-express.sh
   ```

3. Run the setup script with sudo:
   ```bash
   sudo ./setup-express.sh
   ```

   This will:
   - Copy backend code to `/opt/eventease-express`
   - Install npm dependencies
   - Create `.env` file with MongoDB connection
   - Seed the database with sample events and tickets
   - Configure UFW firewall (allows port 5001 only from Node.js VM)
   - Start Express server with PM2
   - Set up log monitoring

4. Verify the server is running:
   ```bash
   pm2 status
   ```

   You should see `eventease-express` in the list with status "online".

### Step 5: Setup Node.js VM (Optional)

**On the Node.js VM (if using a separate Node.js proxy layer):**

1. Navigate to the project directory:
   ```bash
   cd /path/to/IT_340_Project-Milestone3
   ```

2. Make the script executable:
   ```bash
   chmod +x setup-node.sh
   ```

3. Run the setup script with sudo:
   ```bash
   sudo ./setup-node.sh
   ```

   This will:
   - Create a Node.js proxy server
   - Configure UFW firewall (allows port 3000 only from Frontend VM)
   - Start proxy server with PM2
   - Set up log monitoring

**Note:** If you're not using a separate Node.js VM, you can skip this step and configure the Frontend VM to connect directly to the Express VM.

### Step 6: Setup Frontend VM

**On the Frontend VM:**

1. Navigate to the project directory:
   ```bash
   cd /path/to/IT_340_Project-Milestone3
   ```

2. Make the script executable:
   ```bash
   chmod +x setup-frontend.sh
   ```

3. **IMPORTANT:** If you're not using a Node.js VM, you need to update the nginx configuration in `setup-frontend.sh` to proxy directly to the Express VM instead of the Node.js VM.

   Edit `setup-frontend.sh` around line 60-70 and change the proxy_pass line:
   ```nginx
   proxy_pass http://$EXPRESS_IP:5001;  # Direct to Express VM
   ```
   Instead of:
   ```nginx
   proxy_pass http://$NODE_IP:3000;  # Through Node.js VM
   ```

4. Run the setup script with sudo:
   ```bash
   sudo ./setup-frontend.sh
   ```

   This will:
   - Copy frontend files to `/var/www/eventease`
   - Configure Nginx to serve static files
   - Configure UFW firewall (allows ports 80 and 443 from anywhere)
   - Start Nginx service
   - Set up log monitoring

### Step 7: Update Frontend API Configuration

**On the Frontend VM**, you need to update the frontend JavaScript to point to the correct backend URL:

1. Edit `js/config.js`:
   ```bash
   sudo nano /var/www/eventease/js/config.js
   ```

2. Update the `API_BASE_URL` to point to your Express VM (or Node.js VM if using proxy):
   ```javascript
   const API_BASE_URL = 'http://192.168.1.30:5001';  // Express VM IP and port
   // OR if using Node.js proxy:
   // const API_BASE_URL = 'http://192.168.1.20:3000';  // Node.js VM IP and port
   ```

3. Save and exit (Ctrl+X, then Y, then Enter).

### Step 8: Verify Deployment

1. **Check all services are running:**

   **MongoDB VM:**
   ```bash
   sudo systemctl status mongod
   ```

   **Express VM:**
   ```bash
   pm2 status
   ```

   **Node.js VM (if used):**
   ```bash
   pm2 status
   ```

   **Frontend VM:**
   ```bash
   sudo systemctl status nginx
   ```

2. **Access the website:**
   - Open a web browser
   - Navigate to: `http://[FRONTEND_VM_IP]`
   - Example: `http://192.168.1.10`

3. **Test the application:**
   - Browse events on the homepage
   - Create a new account
   - Log in (check the blue alert box for the 2FA code)
   - Purchase a ticket
   - View your dashboard

### Troubleshooting

**If services aren't starting:**
- Check logs: `sudo journalctl -u [service-name]`
- Check PM2 logs: `pm2 logs`
- Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

**If you can't access the website:**
- Verify UFW firewall rules: `sudo ufw status numbered`
- Check if services are running (see Step 8)
- Verify IP addresses are correct in all scripts
- Check network connectivity between VMs: `ping [VM_IP]`

**If database connection fails:**
- Verify MongoDB is running on the MongoDB VM
- Check the MongoDB connection string in Express VM's `.env` file
- Verify firewall allows port 27017 from Express VM to MongoDB VM
- Check MongoDB authentication credentials

**All events are logged to `Monitor.sh` in each VM's project directory.**

## Local Development

For local development and testing on macOS:

1. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   # OR
   mongod --fork --logpath /tmp/mongod.log
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cat > backend/.env <<EOF
   MONGO_URI=mongodb://localhost:27017/eventease
   PORT=5001
   NODE_ENV=development
   JWT_SECRET=your-secret-key-change-in-production
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
   SHOW_OTP=true
   EOF
   ```

4. **Seed the database:**
   ```bash
   cd backend
   npm run seed
   ```

5. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

6. **Start a local web server for the frontend:**
   ```bash
   python3 -m http.server 8000
   ```

7. **Access the application:**
   - Open browser to: `http://localhost:8000`

Alternatively, use the provided `start-local.sh` script:
```bash
chmod +x start-local.sh
./start-local.sh
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Security Notes

- **Change default passwords** in production (MongoDB admin and application users)
- **Update JWT secrets** in production (use strong, random strings)
- **Restrict SSH access** in production (currently allows from anywhere for setup)
- **Use HTTPS** in production (currently configured for HTTP only)
- **Review firewall rules** and restrict access as needed

## Team Information

**Course**: IT 340  
**Project**: EventEase - Event Ticket Marketplace  
**Stack**: MEAN (MongoDB, Express.js, AngularJS/React, Node.js)

---

**Status**: Production Ready ✅
