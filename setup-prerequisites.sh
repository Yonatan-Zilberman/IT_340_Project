#!/bin/bash

# EventEase - Prerequisites Setup Script
# Installs all required software for the MEAN stack
# Run this FIRST on each VM while connected to the internet

set -e

LOG_FILE="Monitor.sh"
VM_NAME="PREREQUISITES"

# Function to log events
log_event() {
    local event_type=$1
    local details=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$VM_NAME] [$event_type] $details" | tee -a "$LOG_FILE"
}

log_event "STARTUP" "Prerequisites setup script started"

# Update system packages
log_event "SYSTEM" "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install basic utilities
log_event "INSTALL" "Installing basic utilities..."
apt-get install -y curl wget git build-essential software-properties-common

# Install Python 3 and pip (for simple HTTP server if needed)
log_event "INSTALL" "Installing Python 3..."
apt-get install -y python3 python3-pip

# Verify Python installation
PYTHON_VERSION=$(python3 --version)
log_event "INSTALL" "Python installed: $PYTHON_VERSION"

# Install Node.js and npm
log_event "INSTALL" "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify Node.js and npm installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_event "INSTALL" "Node.js $NODE_VERSION and npm $NPM_VERSION installed"

# Install PM2 globally for process management
log_event "INSTALL" "Installing PM2 process manager..."
npm install -g pm2

# Verify PM2 installation
PM2_VERSION=$(pm2 --version)
log_event "INSTALL" "PM2 installed: $PM2_VERSION"

# Install UFW firewall (if not already installed)
log_event "INSTALL" "Installing UFW firewall..."
apt-get install -y ufw

# Enable UFW logging
ufw logging on
log_event "INSTALL" "UFW firewall installed and logging enabled"

# Install nginx (needed for frontend VM)
log_event "INSTALL" "Installing nginx..."
apt-get install -y nginx

# Install MongoDB (needed for database VM)
log_event "INSTALL" "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update -y
apt-get install -y mongodb-org

# Verify MongoDB installation
MONGODB_VERSION=$(mongod --version 2>/dev/null | head -1 || echo "MongoDB installed")
log_event "INSTALL" "MongoDB installed: $MONGODB_VERSION"

# Display summary
echo ""
echo "=== Prerequisites Installation Complete ==="
echo "Python: $PYTHON_VERSION"
echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"
echo "PM2: $PM2_VERSION"
echo "MongoDB: $MONGODB_VERSION"
echo ""
echo "All prerequisites installed successfully!"
echo "You can now run the specific VM setup scripts:"
echo "  - setup-frontend.sh (for Frontend VM)"
echo "  - setup-node.sh (for Node.js VM)"
echo "  - setup-express.sh (for Express VM)"
echo "  - setup-db.sh (for MongoDB VM)"
echo ""
log_event "COMPLETE" "Prerequisites setup completed successfully"

