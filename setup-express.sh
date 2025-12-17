#!/bin/bash

# EventEase - ExpressJS VM Setup Script
# Configures and runs the Express backend server

set -e

# Configuration - Edit these IPs as needed for your VLAN
FRONTEND_IP="192.168.1.10"  # Replace with actual Front-End VM IP
NODE_IP="192.168.1.20"      # Replace with actual Node.js VM IP
EXPRESS_IP="192.168.1.30"   # Replace with actual ExpressJS VM IP
MONGODB_IP="192.168.1.40"   # Replace with actual MongoDB VM IP

# Port configuration
EXPRESS_PORT=5001

# Get current directory (where the codebase is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/opt/eventease-express"

# Log file
LOG_FILE="$SCRIPT_DIR/Monitor.sh"
VM_NAME="EXPRESS-VM"

# Function to log events
log_event() {
    local event_type=$1
    local details=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$VM_NAME] [$event_type] $details" | tee -a "$LOG_FILE"
}

log_event "STARTUP" "ExpressJS VM setup script started"

# Check if prerequisites are installed
if ! command -v node &> /dev/null; then
    log_event "ERROR" "Node.js not found. Please run setup-prerequisites.sh first"
    exit 1
fi

# Verify installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_event "INFO" "Node.js $NODE_VERSION and npm $NPM_VERSION detected"

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    log_event "INSTALL" "Installing PM2 process manager..."
    npm install -g pm2
fi

PM2_VERSION=$(pm2 --version)
log_event "INFO" "PM2 $PM2_VERSION available"

# Copy backend code to application directory
log_event "CONFIG" "Copying backend code to application directory..."
mkdir -p "$APP_DIR"
cp -r "$SCRIPT_DIR/backend"/* "$APP_DIR/"
chown -R $USER:$USER "$APP_DIR"

log_event "CONFIG" "Backend code copied to $APP_DIR"

# Install Express dependencies
log_event "INSTALL" "Installing Express dependencies..."
cd "$APP_DIR"
npm install

log_event "INSTALL" "Express dependencies installed"

# Create .env file
log_event "CONFIG" "Creating .env file..."
cat > "$APP_DIR/.env" <<EOF
MONGO_URI=mongodb://eventease_user:changeme_app_password@$MONGODB_IP:27017/eventease?authSource=eventease
PORT=$EXPRESS_PORT
NODE_ENV=production
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
SHOW_OTP=true
EOF

log_event "CONFIG" ".env file created with MongoDB connection to $MONGODB_IP"

# Configure UFW Firewall
log_event "FIREWALL" "Configuring UFW firewall..."

# Reset UFW to defaults
ufw --force reset

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH only from Node.js VM (or Front-End if no Node VM)
if [ "$NODE_IP" != "" ]; then
    ufw allow from $NODE_IP to any port 22 proto tcp
    log_event "FIREWALL" "Rule added: Allow SSH (port 22) from Node.js VM ($NODE_IP)"
    
    # Allow Express application port only from Node.js VM
    ufw allow from $NODE_IP to any port $EXPRESS_PORT proto tcp
    log_event "FIREWALL" "Rule added: Allow Express (port $EXPRESS_PORT) from Node.js VM ($NODE_IP)"
else
    # If no Node VM, allow from Front-End
    ufw allow from $FRONTEND_IP to any port 22 proto tcp
    log_event "FIREWALL" "Rule added: Allow SSH (port 22) from Front-End VM ($FRONTEND_IP)"
    
    ufw allow from $FRONTEND_IP to any port $EXPRESS_PORT proto tcp
    log_event "FIREWALL" "Rule added: Allow Express (port $EXPRESS_PORT) from Front-End VM ($FRONTEND_IP)"
fi

# Enable UFW
ufw --force enable
log_event "FIREWALL" "UFW firewall enabled"

# Create PM2 ecosystem file
log_event "CONFIG" "Creating PM2 configuration..."
cat > "$APP_DIR/ecosystem.config.js" <<EOF
module.exports = {
    apps: [{
        name: 'eventease-express',
        script: './server.js',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
            PORT: $EXPRESS_PORT
        },
        error_file: '/var/log/eventease-express-error.log',
        out_file: '/var/log/eventease-express-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        autorestart: true,
        max_memory_restart: '1G'
    }]
};
EOF

# Seed database if needed
log_event "DATABASE" "Checking if database needs seeding..."
cd "$APP_DIR"
npm run seed 2>&1 | tee -a "$LOG_FILE" || log_event "WARNING" "Database seeding may have failed or database already seeded"

# Start application with PM2
log_event "SERVICE" "Starting Express application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER

log_event "SERVICE" "Express application started with PM2"

# Set up log monitoring
log_event "MONITORING" "Setting up log monitoring..."
cat > /usr/local/bin/monitor-express.sh <<'MONITOR_EOF'
#!/bin/bash
LOG_FILE="/root/Monitor.sh"
while true; do
    # Monitor PM2 logs
    pm2 logs --lines 1 --nostream 2>/dev/null | tail -n 1 | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [EXPRESS-VM] [PM2] $line" >> "$LOG_FILE"
    done
    # Monitor application logs
    tail -n 1 /var/log/eventease-express-out.log 2>/dev/null | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [EXPRESS-VM] [APP] $line" >> "$LOG_FILE"
    done
    # Monitor UFW logs
    tail -n 1 /var/log/ufw.log 2>/dev/null | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [EXPRESS-VM] [UFW] $line" >> "$LOG_FILE"
    done
    sleep 5
done
MONITOR_EOF

chmod +x /usr/local/bin/monitor-express.sh

# Create systemd service for monitoring
cat > /etc/systemd/system/eventease-express-monitor.service <<EOF
[Unit]
Description=EventEase Express Log Monitor
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/monitor-express.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable eventease-express-monitor.service
systemctl start eventease-express-monitor.service

log_event "MONITORING" "Log monitoring service started"

# Log system startup
log_event "SYSTEM" "System startup completed successfully"
log_event "INFO" "ExpressJS VM IP: $EXPRESS_IP"
log_event "INFO" "Express application running on port $EXPRESS_PORT"
log_event "INFO" "MongoDB connection: $MONGODB_IP:27017"
if [ "$NODE_IP" != "" ]; then
    log_event "INFO" "Only accepting connections from Node.js VM ($NODE_IP)"
else
    log_event "INFO" "Only accepting connections from Front-End VM ($FRONTEND_IP)"
fi

# Display status
echo ""
echo "=== ExpressJS VM Setup Complete ==="
echo "Node.js Version: $NODE_VERSION"
echo "npm Version: $NPM_VERSION"
echo "PM2 Version: $PM2_VERSION"
echo "Application Status:"
pm2 status
echo ""
echo "UFW Status: $(ufw status | head -1)"
echo ""
echo "Firewall Rules:"
ufw status numbered
echo ""
echo "MongoDB Connection: mongodb://$MONGODB_IP:27017/eventease"
echo "All events logged to: $LOG_FILE"
log_event "COMPLETE" "ExpressJS VM setup completed successfully"
