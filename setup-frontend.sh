#!/bin/bash

# EventEase - Front-End VM Setup Script
# Configures nginx web server, UFW firewall, and starts serving the frontend

set -e

# Configuration - Edit these IPs as needed for your VLAN
FRONTEND_IP="192.168.1.10"  # Replace with actual Front-End VM IP
NODE_IP="192.168.1.20"      # Replace with actual Node.js VM IP
EXPRESS_IP="192.168.1.30"   # Replace with actual ExpressJS VM IP
MONGODB_IP="192.168.1.40"   # Replace with actual MongoDB VM IP

# Get current directory (where the codebase is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_ROOT="/var/www/eventease"

# Log file
LOG_FILE="$SCRIPT_DIR/Monitor.sh"
VM_NAME="FRONTEND-VM"

# Function to log events
log_event() {
    local event_type=$1
    local details=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$VM_NAME] [$event_type] $details" | tee -a "$LOG_FILE"
}

log_event "STARTUP" "Front-End VM setup script started"

# Check if prerequisites are installed
if ! command -v nginx &> /dev/null; then
    log_event "ERROR" "Nginx not found. Please run setup-prerequisites.sh first"
    exit 1
fi

# Stop nginx if running
systemctl stop nginx 2>/dev/null || true

# Copy frontend files to web root
log_event "CONFIG" "Copying frontend files to web root..."
mkdir -p "$WEB_ROOT"
cp -r "$SCRIPT_DIR"/*.html "$WEB_ROOT/" 2>/dev/null || true
cp -r "$SCRIPT_DIR"/css "$WEB_ROOT/" 2>/dev/null || true
cp -r "$SCRIPT_DIR"/js "$WEB_ROOT/" 2>/dev/null || true

# Set proper permissions
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

log_event "CONFIG" "Frontend files copied to $WEB_ROOT"

# Configure nginx
log_event "CONFIG" "Configuring nginx..."
cat > /etc/nginx/sites-available/eventease <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    root $WEB_ROOT;
    index index.html;
    
    # Logging
    access_log /var/log/nginx/eventease-access.log;
    error_log /var/log/nginx/eventease-error.log;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    # API proxy to Express VM (if needed for CORS)
    location /api/ {
        proxy_pass http://$EXPRESS_IP:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/eventease /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
log_event "CONFIG" "Testing nginx configuration..."
nginx -t

# Configure UFW Firewall
log_event "FIREWALL" "Configuring UFW firewall..."

# Reset UFW to defaults
ufw --force reset

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (port 22) - Important: Allow from anywhere for initial setup
ufw allow 22/tcp
log_event "FIREWALL" "Rule added: Allow SSH (port 22) from anywhere"

# Allow HTTP (port 80) from anywhere
ufw allow 80/tcp
log_event "FIREWALL" "Rule added: Allow HTTP (port 80) from anywhere"

# Allow HTTPS (port 443) from anywhere
ufw allow 443/tcp
log_event "FIREWALL" "Rule added: Allow HTTPS (port 443) from anywhere"

# Enable UFW
ufw --force enable
log_event "FIREWALL" "UFW firewall enabled"

# Start and enable nginx
log_event "SERVICE" "Starting nginx..."
systemctl start nginx
systemctl enable nginx

# Verify nginx is running
if systemctl is-active --quiet nginx; then
    log_event "SERVICE" "Nginx started successfully"
else
    log_event "ERROR" "Nginx failed to start"
    systemctl status nginx
    exit 1
fi

# Set up log monitoring
log_event "MONITORING" "Setting up log monitoring..."
cat > /usr/local/bin/monitor-frontend.sh <<'MONITOR_EOF'
#!/bin/bash
LOG_FILE="/root/Monitor.sh"
while true; do
    # Monitor nginx access logs
    tail -n 1 /var/log/nginx/eventease-access.log 2>/dev/null | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [FRONTEND-VM] [NGINX-ACCESS] $line" >> "$LOG_FILE"
    done
    # Monitor UFW logs
    tail -n 1 /var/log/ufw.log 2>/dev/null | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [FRONTEND-VM] [UFW] $line" >> "$LOG_FILE"
    done
    sleep 5
done
MONITOR_EOF

chmod +x /usr/local/bin/monitor-frontend.sh

# Create systemd service for monitoring
cat > /etc/systemd/system/eventease-frontend-monitor.service <<EOF
[Unit]
Description=EventEase Frontend Log Monitor
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/monitor-frontend.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable eventease-frontend-monitor.service
systemctl start eventease-frontend-monitor.service

log_event "MONITORING" "Log monitoring service started"

# Log system startup
log_event "SYSTEM" "System startup completed successfully"
log_event "INFO" "Front-End VM IP: $FRONTEND_IP"
log_event "INFO" "Nginx is running on ports 80 and 443"
log_event "INFO" "Web root: $WEB_ROOT"
log_event "INFO" "UFW firewall is active with rules: 22, 80, 443"

# Display status
echo ""
echo "=== Front-End VM Setup Complete ==="
echo "Nginx Status: $(systemctl is-active nginx)"
echo "UFW Status: $(ufw status | head -1)"
echo "Web root: $WEB_ROOT"
echo ""
echo "Firewall Rules:"
ufw status numbered
echo ""
echo "Nginx is serving files from: $WEB_ROOT"
echo "Access the website at: http://$FRONTEND_IP"
echo ""
echo "All events logged to: $LOG_FILE"
log_event "COMPLETE" "Front-End VM setup completed successfully"
