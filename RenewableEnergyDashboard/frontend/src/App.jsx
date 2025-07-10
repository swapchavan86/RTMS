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
      <footer style={{textAlign: 'center', padding: '20px', marginTop: '30px', borderTop: '1px solid #eee'}}>
        <p>© 2023 Office Green Initiative</p>
      </footer>
    </div>
  );
}

export default App;
