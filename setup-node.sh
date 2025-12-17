#!/bin/bash

# EventEase - Node.js VM Setup Script
# This VM can be used for additional Node.js processing if needed
# For now, it's set up as a pass-through/proxy layer

set -e

# Configuration - Edit these IPs as needed for your VLAN
FRONTEND_IP="192.168.1.10"  # Replace with actual Front-End VM IP
NODE_IP="192.168.1.20"      # Replace with actual Node.js VM IP
EXPRESS_IP="192.168.1.30"   # Replace with actual ExpressJS VM IP
MONGODB_IP="192.168.1.40"   # Replace with actual MongoDB VM IP

# Port configuration
NODE_PORT=3000

# Get current directory (where the codebase is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/opt/eventease-node"

# Log file
LOG_FILE="$SCRIPT_DIR/Monitor.sh"
VM_NAME="NODE-VM"

# Function to log events
log_event() {
    local event_type=$1
    local details=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$VM_NAME] [$event_type] $details" | tee -a "$LOG_FILE"
}

log_event "STARTUP" "Node.js VM setup script started"

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

# Create application directory
log_event "CONFIG" "Creating application directory..."
mkdir -p "$APP_DIR"
chown -R $USER:$USER "$APP_DIR"

# Create a simple proxy/health check server
log_event "CONFIG" "Creating Node.js proxy server..."
cat > "$APP_DIR/server.js" <<'EOF'
const http = require('http');
const express = require('express');
const app = express();

const EXPRESS_IP = process.env.EXPRESS_IP || '192.168.1.30';
const EXPRESS_PORT = process.env.EXPRESS_PORT || '5001';
const NODE_PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'node-vm',
        timestamp: new Date().toISOString()
    });
});

// Proxy requests to Express VM
app.use('/api', (req, res) => {
    const proxyReq = http.request({
        hostname: EXPRESS_IP,
        port: EXPRESS_PORT,
        path: req.path,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    req.pipe(proxyReq);
    
    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(502).json({ error: 'Cannot connect to Express VM' });
    });
});

app.listen(NODE_PORT, '0.0.0.0', () => {
    console.log(`Node.js VM proxy server running on port ${NODE_PORT}`);
    console.log(`Proxying to Express VM at ${EXPRESS_IP}:${EXPRESS_PORT}`);
});
EOF

# Install express for the proxy
log_event "INSTALL" "Installing Express for proxy..."
cd "$APP_DIR"
npm init -y
npm install express --save

# Configure UFW Firewall
log_event "FIREWALL" "Configuring UFW firewall..."

# Reset UFW to defaults
ufw --force reset

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH only from Front-End VM
ufw allow from $FRONTEND_IP to any port 22 proto tcp
log_event "FIREWALL" "Rule added: Allow SSH (port 22) from Front-End VM ($FRONTEND_IP)"

# Allow Node.js application port only from Front-End VM
ufw allow from $FRONTEND_IP to any port $NODE_PORT proto tcp
log_event "FIREWALL" "Rule added: Allow Node.js (port $NODE_PORT) from Front-End VM ($FRONTEND_IP)"

# Enable UFW
ufw --force enable
log_event "FIREWALL" "UFW firewall enabled"

# Create PM2 ecosystem file
log_event "CONFIG" "Creating PM2 configuration..."
cat > "$APP_DIR/ecosystem.config.js" <<EOF
module.exports = {
    apps: [{
        name: 'eventease-node',
        script: './server.js',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
            PORT: $NODE_PORT,
            EXPRESS_IP: '$EXPRESS_IP',
            EXPRESS_PORT: '5001'
        },
        error_file: '/var/log/eventease-node-error.log',
        out_file: '/var/log/eventease-node-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        autorestart: true,
        max_memory_restart: '1G'
    }]
};
EOF

# Start application with PM2
log_event "SERVICE" "Starting Node.js application with PM2..."
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER

log_event "SERVICE" "Node.js application started with PM2"

# Set up log monitoring
log_event "MONITORING" "Setting up log monitoring..."
cat > /usr/local/bin/monitor-node.sh <<'MONITOR_EOF'
#!/bin/bash
LOG_FILE="/root/Monitor.sh"
while true; do
    # Monitor PM2 logs
    pm2 logs --lines 1 --nostream 2>/dev/null | tail -n 1 | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [NODE-VM] [PM2] $line" >> "$LOG_FILE"
    done
    # Monitor UFW logs
    tail -n 1 /var/log/ufw.log 2>/dev/null | while read line; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [NODE-VM] [UFW] $line" >> "$LOG_FILE"
    done
    sleep 5
done
MONITOR_EOF

chmod +x /usr/local/bin/monitor-node.sh

# Create systemd service for monitoring
cat > /etc/systemd/system/eventease-node-monitor.service <<EOF
[Unit]
Description=EventEase Node.js Log Monitor
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/monitor-node.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable eventease-node-monitor.service
systemctl start eventease-node-monitor.service

log_event "MONITORING" "Log monitoring service started"

# Log system startup
log_event "SYSTEM" "System startup completed successfully"
log_event "INFO" "Node.js VM IP: $NODE_IP"
log_event "INFO" "Node.js application running on port $NODE_PORT"
log_event "INFO" "Proxying to Express VM at $EXPRESS_IP:5001"
log_event "INFO" "Only accepting connections from Front-End VM ($FRONTEND_IP)"

# Display status
echo ""
echo "=== Node.js VM Setup Complete ==="
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
echo "All events logged to: $LOG_FILE"
log_event "COMPLETE" "Node.js VM setup completed successfully"
