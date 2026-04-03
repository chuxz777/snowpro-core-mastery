#!/bin/bash
# Certification Mastery Suite - Easy Start Script
# This script sets up and runs the application automatically

set -e

echo "🚀 Starting Certification Mastery Suite..."
echo ""

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv (Python package manager)..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    uv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source .venv/bin/activate

# Install/sync dependencies
echo "📚 Installing dependencies..."
uv pip install --upgrade pip

# Get available port
PORT=8080
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; do
    echo "⚠️  Port $PORT is in use, trying next port..."
    PORT=$((PORT + 1))
done

echo ""
echo "✨ Setup complete!"
echo ""
echo "🌐 Starting web server on port $PORT..."
echo "📱 Open your browser to: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 -m http.server $PORT

# Made with Bob
