#!/bin/bash
# MEDIVISION Hospital Finder Map - Quick Start Script
# This script helps you get the map running locally

echo "🏥 MEDIVISION - Hospital Finder Map"
echo "===================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found!"
    echo "Please run this script from the map-module directory"
    exit 1
fi

echo "✅ Found map files"
echo ""

# Check for Python or Node.js
if command -v python3 &> /dev/null; then
    echo "🐍 Starting server with Python..."
    echo ""
    echo "📍 Server running at: http://localhost:8000"
    echo "🌐 Open this URL in your browser: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000

elif command -v python &> /dev/null; then
    echo "🐍 Starting server with Python 2..."
    echo ""
    echo "📍 Server running at: http://localhost:8000"
    echo "🌐 Open this URL in your browser: http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000

elif command -v node &> /dev/null; then
    echo "Node.js detected. Installing http-server..."
    npm install -g http-server
    echo ""
    echo "🚀 Starting server with http-server..."
    echo ""
    echo "📍 Server running at: http://localhost:8080"
    echo "🌐 Open this URL in your browser: http://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    http-server -p 8080

else
    echo "❌ Error: No Python or Node.js found!"
    echo ""
    echo "Please install one of the following:"
    echo "1. Python 3: https://www.python.org/downloads/"
    echo "2. Node.js: https://nodejs.org/"
    echo ""
    echo "Or, use the manual method:"
    echo "1. Open index.html directly in your browser"
    echo "2. Right-click index.html → Open with → Python/Node server"
    exit 1
fi
