import React from 'react';
import './App.css';
import DashboardPage from './pages/DashboardPage'; // Import the DashboardPage

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Renewable Energy & Office Sustainability Dashboard</h1>
      </header>
      <main>
        <DashboardPage /> {/* Render the DashboardPage */}
      </main>
      <footer className="App-footer">
        <p>© 2025 Office Green Initiative</p>
      </footer>
    </div>
  );
}

export default App;
