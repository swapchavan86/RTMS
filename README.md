# Renewable Energy Dashboard

This project is a dashboard designed to track office energy usage and CO2 emissions, encouraging employees to reduce emissions through a gamified incentivization system. Employees earn "Awe Points" for their participation.

The application features a frontend built with React and a backend powered by FastAPI. Currently, it uses mock data generated randomly, with a provision to switch to a live database in the future.

## Demo
https://rtms-frontend.onrender.com/

## Project Structure

```
.
│
├── frontend/               # React Frontend Application
│   ├── public/             # Static assets and index.html
│   ├── src/                # Frontend source code
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Top-level page components
│   │   ├── services/       # API call functions
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── App.css         # Main app styling
│   │   ├── App.jsx         # Main React app component
│   │   └── index.js        # Entry point for React app
│   ├── package.json        # Frontend dependencies and scripts
│   └── ...
│
├── backend/                # FastAPI Backend Application
│   ├── app/                # Main application module
│   │   ├── main.py         # FastAPI entry point, middleware
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic, data generation
│   │   ├── models/         # Pydantic data models
│   │   └── prompts/        # (Placeholder for future AI/prompt features)
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
│
├── datasets/               # Sample and mock data files
│   ├── mock_sensor_data.json
│   └── energy_usage_sample.csv
│
├── automation/             # Test automation scripts
│   └── test_scripts.py
│
├── diagrams/               # System architecture diagrams
│   └── architecture.mmd    # Mermaid diagram file
│
├── README.md               # This file
└── .gitignore              # Specifies intentionally untracked files for Git
```

## Features

*   **Energy Consumption Tracking:** Displays usage for laptops, lighting, HVAC systems.
*   **Seating Proximity:** Visualizes office seating and suggests optimizations to save energy.
*   **Gamified Incentives:** Employees earn Awe Points for energy-saving actions.
*   **Leaderboard:** Shows employees with the most Awe Points.
*   **Graphical Data Representation:** Charts for visualizing energy trends.
*   **Mock Data Generation:** Simulates real-time data for development and demonstration. Switchable to live data source.

## Setup and Installation

Follow these steps to set up and run the project locally.

### Prerequisites

*   **Node.js and npm:** (v16+ recommended) for the frontend. [Download Node.js](https://nodejs.org/)
*   **Python:** (v3.8+ recommended) for the backend. [Download Python](https://www.python.org/)
*   **Git:** For cloning the repository. [Download Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone <repository-url> # Replace <repository-url> with the actual URL
cd <repository-name> # e.g., cd renewable-energy-dashboard
```

### 2. Backend Setup

The backend is a FastAPI application.

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (Git Bash or PowerShell):
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
# Uvicorn will typically run on http://localhost:8000
uvicorn app.main:app --reload
```
The backend API will now be running. You can access its documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup

The frontend is a React application.

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
# React app will typically run on http://localhost:3000
npm start
```
The application should now be accessible in your web browser at `http://localhost:3000`.

## Running Tests

### Backend Tests

To run the backend tests, navigate to the `backend` directory and run:

```bash
# Ensure your virtual environment is activated
# pip install pytest pytest-cov (if not already in requirements.txt)
pytest
```
To include coverage reports:
```bash
pytest --cov=app
```

### Frontend Tests

To run the frontend tests, navigate to the `frontend` directory and run:

```bash
# npm install (if you haven't already)
npm test
```
This will run the tests using the configured test runner (likely Jest with React Testing Library).

## Usage

*   Open your browser and navigate to `http://localhost:3000`.
*   The dashboard will display mock data for various energy components and the employee leaderboard.
*   Explore different sections like laptop usage, lighting, and seating proximity.

## Future Enhancements

*   Integration with a real database (e.g., PostgreSQL, MongoDB).
*   User authentication and profiles.
*   Real-time data updates using WebSockets.
*   More sophisticated energy-saving suggestions.
*   Admin panel for managing users and office configurations.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.
(Further details on contribution guidelines can be added here).
