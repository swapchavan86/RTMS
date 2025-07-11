import React, { useState, useEffect } from 'react'; // Removed useState, useEffect if all data fetching moves
import Leaderboard from '../components/Leaderboard';
// EnergyConsumptionCard and GraphComponent are now primarily used within ConsolidatedStats for these sections
import SeatingChart from '../components/SeatingChart';
import ConsolidatedStats from '../components/ConsolidatedStats'; // Import the new component

// APIs for laptop, lighting, hvac are now called within ConsolidatedStats
// import {
//     getLaptopUsage,
//     getLightingStatus,
//     getHvacStatus
// } from '../services/api';

const DashboardPage = () => {
  // Laptop, Lighting, HVAC data states and fetching logic are moved to ConsolidatedStats.jsx
  // const [laptopData, setLaptopData] = useState([]);
  // const [lightingData, setLightingData] = useState([]);
  // const [hvacData, setHvacData] = useState([]);

  // The main DashboardPage might still have a loading state for other components if they fetch data,
  // or a general loading state if ConsolidatedStats indicates loading.
  // For now, assuming ConsolidatedStats handles its own loading/error states internally.
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
    // This useEffect was for fetching laptop, lighting, hvac data.
    // It's removed as ConsolidatedStats now handles this.
    // If DashboardPage fetched other data, that would remain here.
  // }, []);

  // Graph data preparation for laptop, lighting, hvac is also moved to ConsolidatedStats.jsx

  // Simplification: Main page loading/error states could be driven by status from child components
  // or a simpler check. For now, we let ConsolidatedStats render its own loader/error.
  // If other components (Leaderboard, SeatingChart) also have heavy loading,
  // a global skeleton/loader for the page might be better.

  // Example: if (loading) return <PageLoader />;
  // Example: if (error) return <PageError message={error} />;

  return (
    <div className="App-main-container">
      {/* Column 1: Consolidated Energy Stats & Awe Points Tips */}
      <div className="dashboard-column dashboard-column-1">
        <ConsolidatedStats />
      </div>

      {/* Column 2: Employee Engagement */}
      <div className="dashboard-column dashboard-column-2">
        <Leaderboard className="leaderboard-section dashboard-section" />
      </div>

      {/* Column 3: Interactive Office Map */}
      <div className="dashboard-column dashboard-column-3">
        <SeatingChart className="seating-section dashboard-section" />
      </div>
    </div>
  );
};

export default DashboardPage;