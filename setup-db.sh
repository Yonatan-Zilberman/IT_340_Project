#!/bin/bash

# EventEase - MongoDB VM Setup Script
# Configures MongoDB, UFW firewall, and starts the database

set -e

# Configuration - Edit these IPs as needed for your VLAN
FRONTEND_IP="192.168.1.10"  # Replace with actual Front-End VM IP
NODE_IP="192.168.1.20"      # Replace with actual Node.js VM IP
EXPRESS_IP="192.168.1.30"   # Replace with actual ExpressJS VM IP
MONGODB_IP="192.168.1.40"   # Replace with actual MongoDB VM IP

# MongoDB configuration
MONGODB_PORT=27017

# Log file
LOG_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/Monitor.sh"
VM_NAME="MONGODB-VM"

# Function to log events
log_event() {
    local event_type=$1
    local details=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$VM_NAME] [$event_type] $details" | tee -a "$LOG_FILE"
}

log_event "STARTUP" "MongoDB VM setup script started"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    log_event "ERROR" "MongoDB not found. Please run setup-prerequisites.sh first"
    exit 1
fi

# Verify installation
MONGODB_VERSION=$(mongod --version 2>/dev/null | head -1 || echo "MongoDB installed")
log_event "INFO" "MongoDB detected: $MONGODB_VERSION"

# Stop MongoDB if running
systemctl stop mongod 2>/dev/null || true

# Configure MongoDB
log_event "CONFIG" "Configuring MongoDB..."

# Create MongoDB data directory
mkdir -p /data/db
chown -R mongodb:mongodb /data/db

# Get current MongoDB config
MONGODB_CONF="/etc/mongod.conf"

# Backup original config
cp "$MONGODB_CONF" "$MONGODB_CONF.backup" 2>/dev/null || true

# Configure MongoDB to bind to private VLAN IP and localhost
log_event "CONFIG" "Configuring MongoDB to bind to $MONGODB_IP and 127.0.0.1"
sed -i "s|bindIp:.*|bindIp: $MONGODB_IP,127.0.0.1|" "$MONGODB_CONF" 2>/dev/null || \
    echo -e "\nnet:\n  bindIp: $MONGODB_IP,127.0.0.1\n  port: $MONGODB_PORT" >> "$MONGODB_CONF"

# Enable MongoDB logging
log_event "CONFIG" "Enabling MongoDB logging..."
sed -i 's/#systemLog:/systemLog:/' "$MONGODB_CONF" 2>/dev/null || true
sed -i 's|#  destination: file|  destination: file|' "$MONGODB_CONF" 2>/dev/null || \
    echo -e "systemLog:\n  destination: file\n  logAppend: true\n  path: /var/log/mongodb/mongod.log" >> "$MONGODB_CONF"

# Start MongoDB without authentication first to create users
log_event "SERVICE" "Starting MongoDB (temporary, no auth)..."
systemctl start mongod
sleep 5

# Check if MongoDB is running
if ! systemctl is-active --quiet mongod; then
    log_event "ERROR" "MongoDB failed to start"
    systemctl status mongod
    exit 1
fi

log_event "SERVICE" "MongoDB started successfully"

# Create admin user
log_event "DATABASE" "Creating MongoDB admin user..."
mongosh admin --quiet --eval "
try {
    db.getUser('admin');
    print('Admin user already exists');
} catch(e) {
    db.createUser({
        user: 'admin',
        pwd: 'changeme_admin_password',
        roles: [{ role: 'root', db: 'admin' }]
    });
    print('Admin user created');
}
" 2>&1 | tee -a "$LOG_FILE" || log_event "WARNING" "Admin user creation may have failed"

# Create application database and user
log_event "DATABASE" "Creating application database and user..."
mongosh eventease --quiet --eval "
try {
    db.getUser('eventease_user');
    print('Application user already exists');
} catch(e) {
    db.createUser({
        user: 'eventease_user',
        pwd: 'changeme_app_password',
        roles: [{ role: 'readWrite', db: 'eventease' }]
    });
    print('Application user created');
}
" 2>&1 | tee -a "$LOG_FILE" || log_event "WARNING" "Application user creation may have failed"

# Enable authentication in MongoDB config
log_event "CONFIG" "Enabling MongoDB authentication..."
if grep -q "^security:" "$MONGODB_CONF"; then
    sed -i '/^security:/a \  authorization: enabled' "$MONGODB_CONF"
else
    echo -e "\nsecurity:\n  authorization: enabled" >> "$MONGODB_CONF"
fi

# Restart MongoDB with authentication
log_event "SERVICE" "Restarting MongoDB with authentication..."
systemctl restart mongod
systemctl enable mongod

sleep 3

# Verify MongoDB is running
if systemctl is-active --quiet mongod; then
    log_event "SERVICE" "MongoDB started and enabled with authentication"
else
    log_event "ERROR" "MongoDB failed to start with authentication"
    systemctl status mongod
    exit 1
fi

# Configure UFW Firewall
log_event "FIREWALL" "Configuring UFW firewall..."

# Reset UFW to defaults
ufw --force reset

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH only from ExpressJS VM
ufw allow from $EXPRESS_IP to any port 22 proto tcp
log_event "FIREWALL" "Rule added: Allow SSH (port 22) from ExpressJS VM ($EXPRESS_IP)"

# Allow MongoDB port only from ExpressJS VM
ufw allow from $EXPRESS_IP to any port $MONGODB_PORT proto tcp
log_event "FIREWALL" "Rule added: Allow MongoDB (port $MONGODB_PORT) from ExpressJS VM ($EXPRESS_IP)"

# Enable UFW
ufw --force enable
log_event "FIREWALL" "UFW firewall enabled"

# Set up log monitoring
log_event "MONITORING" "Setting up log monitoring..."
cat > /usr/local/bin/monitor-mongodb.sh <<'MONITOR_EOF'
#!/bin/bash
LOG_FILE="/root/Monitor.sh"
while true; do
    # Monitor MongoDB logs
    tail -n 1 /var/log/mongodb/mongod.log 2>/dev/null | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [MONGODB-VM] [MONGODB] $line" >> "$LOG_FILE"
    done
    # Monitor UFW logs
    tail -n 1 /var/log/ufw.log 2>/dev/null | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [MONGODB-VM] [UFW] $line" >> "$LOG_FILE"
    done
    # Monitor MongoDB status
    if systemctl is-active --quiet mongod; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [MONGODB-VM] [STATUS] MongoDB is running" >> "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [MONGODB-VM] [STATUS] MongoDB is NOT running" >> "$LOG_FILE"
    fi
    sleep 10
done
MONITOR_EOF

chmod +x /usr/local/bin/monitor-mongodb.sh

# Create systemd service for monitoring
cat > /etc/systemd/system/eventease-mongodb-monitor.service <<EOF
[Unit]
Description=EventEase MongoDB Log Monitor
After=network.target mongod.service

[Service]
Type=simple
ExecStart=/usr/local/bin/monitor-mongodb.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable eventease-mongodb-monitor.service
systemctl start eventease-mongodb-monitor.service

log_event "MONITORING" "Log monitoring service started"

# Log system startup
log_event "SYSTEM" "System startup completed successfully"
log_event "INFO" "MongoDB VM IP: $MONGODB_IP"
log_event "INFO" "MongoDB is running on port $MONGODB_PORT"
log_event "INFO" "MongoDB is bound to $MONGODB_IP (private VLAN) and 127.0.0.1"
log_event "INFO" "Only accepting connections from ExpressJS VM ($EXPRESS_IP)"
log_event "WARNING" "Please change default MongoDB passwords in production!"

# Display status
echo ""
echo "=== MongoDB VM Setup Complete ==="
echo "MongoDB Version: $MONGODB_VERSION"
echo "MongoDB Status: $(systemctl is-active mongod)"
echo "UFW Status: $(ufw status | head -1)"
echo ""
echo "Firewall Rules:"
ufw status numbered
echo ""
echo "MongoDB Connection String (for ExpressJS VM):"
echo "mongodb://eventease_user:changeme_app_password@$MONGODB_IP:$MONGODB_PORT/eventease?authSource=eventease"
echo ""
echo "Database Users Created:"
echo "  - admin (root access)"
echo "  - eventease_user (readWrite on eventease database)"
echo ""
echo "All events logged to: $LOG_FILE"
log_event "COMPLETE" "MongoDB VM setup completed successfully"
