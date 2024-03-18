@echo off
cd /d %~dp0

:: Check for Python and guide for installation if not exists
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python from https://www.python.org/downloads/ and add it to the system PATH.
    pause
    exit
)

:: Check for yarn and guide for installation if not exists
yarn --version > nul 2>&1
if %errorlevel% neq 0 (
    echo yarn is not installed. Please install yarn from https://classic.yarnpkg.com/en/docs/install/#windows-stable and add it to the system PATH.
    pause
    exit
)

:: Check if the virtual environment exists, if not create it
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

:: Navigate to the backend directory
cd backend

:: Activate the virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

:: Install requirements
echo Installing backend dependencies...
pip install -r requirements.txt

:: Start the Flask application in the background
echo Starting backend server...
start /b flask run

:: Navigate to the frontend directory
cd ..
cd frontend

:: Install frontend dependencies
echo Installing frontend dependencies...
yarn install

:: Start the frontend development server
echo Starting frontend server...
start /b yarn dev

echo Servers are running...
echo Press any key to stop the servers.
pause > nul

:: Kill Flask and Yarn processes
echo Stopping servers...
taskkill /im flask.exe /f
taskkill /im node.exe /f
echo Servers stopped.
