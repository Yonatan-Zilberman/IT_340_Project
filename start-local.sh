#!/bin/bash

# Quick start script for local testing on macOS

echo "🚀 Starting EventEase locally..."
echo ""

# Check if MongoDB is running
if ! pgrep -x mongod > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    if command -v brew &> /dev/null; then
        brew services start mongodb-community 2>/dev/null || mongod --fork --logpath /tmp/mongod.log
    else
        mongod --fork --logpath /tmp/mongod.log
    fi
    sleep 2
    echo "✅ MongoDB started"
else
    echo "✅ MongoDB is already running"
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cat > backend/.env <<EOF
MONGO_URI=mongodb://localhost:27017/eventease
PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
SHOW_OTP=true
EOF
    echo "✅ .env file created"
fi

# Check if database is seeded
echo ""
echo "🌱 Checking database..."
cd backend
DB_COUNT=$(node -e "require('mongoose').connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventease').then(() => require('mongoose').connection.db.collection('users').countDocuments().then(c => {console.log(c); process.exit(0);})).catch(() => {console.log('0'); process.exit(0);})" 2>/dev/null || echo "0")

if [ "$DB_COUNT" = "0" ] || [ -z "$DB_COUNT" ]; then
    echo "📊 Seeding database..."
    npm run seed
else
    echo "✅ Database already has data"
fi

echo ""
echo "🎯 Starting backend server..."
echo "   Backend will run on: http://localhost:5001"
echo ""
echo "📋 Next steps:"
echo "   1. Keep this terminal open (backend is running)"
echo "   2. Open a NEW terminal and run:"
echo "      cd $(pwd)/.."
echo "      python3 -m http.server 8000"
echo "   3. Open browser to: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the backend server"
echo ""

# Start the backend server
npm start

