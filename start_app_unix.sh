#!/bin/bash

# Navigate to the root directory of your project
cd "$(dirname "$0")"

# Check for Python and install if not exists
if ! command -v python3 &> /dev/null
then
    echo "Python could not be found. Attempting to install..."
    # For Mac
    if [[ "$OSTYPE" == "darwin"* ]]; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        brew install python
    # For Ubuntu/Debian:
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install python3
    fi
fi

# Check for yarn and install if not exists
if ! command -v yarn &> /dev/null
then
    echo "yarn could not be found. Attempting to install..."
    # For Mac
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install yarn
    # For Ubuntu/Debian:
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
        sudo apt-get update && sudo apt-get install yarn
    fi
fi

# Check if the virtual environment exists, if not create it
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Navigate to the backend directory
cd backend

# Install requirements
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Start the Flask application in the background
echo "Starting backend server..."
flask run &

# Store the backend process ID
BACKEND_PID=$!

# Navigate to the frontend directory
cd ../frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
yarn install

# Start the frontend development server
echo "Starting frontend server..."
yarn dev &

# Store the frontend process ID
FRONTEND_PID=$!

# Trap Ctrl+C and kill both frontend and backend processes
trap "echo; echo 'Stopping servers...'; kill $BACKEND_PID; kill $FRONTEND_PID; exit 1" INT

# Wait for frontend and backend to exit
wait $FRONTEND_PID
wait $BACKEND_PID
