import React, { useState, useEffect } from 'react';
// Removed EnergyConsumptionCard import as we'll define styles directly or use .dashboard-section
import GraphComponent from './GraphComponent';
import { getLaptopUsage, getLightingStatus, getHvacStatus } from '../services/api';

const AwePointsTips = () => {
  const tips = [
    "Use Dark Mode on your laptop to save energy.",
    "Participate in seat consolidation for better HVAC efficiency.",
    "Turn off lights in unused meeting rooms.",
    "Report any energy wastage you notice.",
    "Use smart power strips to manage peripheral device energy.",
    "Opt for video conferencing to reduce travel.",
    "Unplug chargers when not in use."
  ];
  const [currentTip, setCurrentTip] = useState('');

  useEffect(() => {
    setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    
    const tipInterval = setInterval(() => {
        setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 15000); // Change tip every 15 seconds

    return () => clearInterval(tipInterval); // Cleanup on unmount
  }, []);

  return (
    // Apply .dashboard-section for consistent card styling, or use custom .awe-tips-section
    <div className="dashboard-section awe-tips-container">
      <h4>Tip of the Day</h4>
      {currentTip ? <p>{currentTip}</p> : <p>Loading tip...</p>}
    </div>
  );
};

const ConsolidatedStats = () => {
  const [laptopData, setLaptopData] = useState([]);
  const [lightingData, setLightingData] = useState([]);
  const [hvacData, setHvacData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllStatsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [laptopRes, lightingRes, hvacRes] = await Promise.all([
          getLaptopUsage(),
          getLightingStatus(),
          getHvacStatus()
        ]);
        setLaptopData(laptopRes.data || []);
        setLightingData(lightingRes.data || []);
        setHvacData(hvacRes.data || []);
      } catch (err) {
        console.error("Error fetching consolidated stats data:", err);
        setError(err.message || "Failed to fetch energy stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllStatsData();
  }, []);

  const laptopUsageModeData = {
    labels: ['Light', 'Dark'], // Shorter labels for pie/doughnut
    datasets: [
      {
        label: 'Laptop Mode',
        data: [
          laptopData.filter(d => d.mode === 'Light Mode').length,
          laptopData.filter(d => d.mode === 'Dark Mode').length,
        ],
      },
    ],
  };

  const lightingStatusData = {
    labels: ['ON', 'OFF'],
    datasets: [
      {
        label: 'Lighting Status',
        data: [
          lightingData.filter(d => d.status === 'ON').length,
          lightingData.filter(d => d.status === 'OFF').length,
        ],
      },
    ],
  };

  const hvacStatusOverviewData = {
    labels: ['ON', 'ECO', 'OFF'],
    datasets: [
      {
        label: 'HVAC Status',
        data: [
          hvacData.filter(d => d.status === 'ON').length,
          hvacData.filter(d => d.status === 'ECO').length,
          hvacData.filter(d => d.status === 'OFF').length,
        ],
      },
    ],
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 8,
          boxWidth: 12,
          font: { size: 10 }
        }
      },
      tooltip: { enabled: true, bodyFont: {size: 10}, titleFont: {size: 12} }
    },
  };

  const barChartOptions = {
    ...commonChartOptions,
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, ticks: { font: { size: 9 } } },
      y: { ticks: { font: { size: 9 } } }
    },
    plugins: { ...commonChartOptions.plugins, legend: { display: false } },
  };

  if (loading) {
    return (
      <div className="dashboard-section loading-shimmer" style={{ minHeight: '300px', borderRadius: 'var(--border-radius-xl)' }}>
        Loading Energy Statistics...
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-section error-message-box">Error: {error}</div>;
  }

  return (
    <div className="consolidated-stats-container"> {/* Main wrapper for this component */}
      <div className="dashboard-section energy-stats-overview">
        <h3>Core Energy Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <h4>💻 Laptops</h4>
            <div className="stat-item-content">
              <p>Total: {laptopData.length}</p>
              <p>Avg On: {(laptopData.reduce((acc, curr) => acc + curr.hours_on, 0) / (laptopData.length || 1)).toFixed(1)}h</p>
            </div>
            {laptopData.length > 0 && (
              <div className="mini-graph-container">
                <GraphComponent type="pie" data={laptopUsageModeData} options={commonChartOptions} height="100px" />
              </div>
            )}
          </div>

          <div className="stat-item">
            <h4>💡 Lighting</h4>
            <div className="stat-item-content">
              <p>Zones: {lightingData.length}</p>
              <p>ON: {lightingData.filter(d => d.status === 'ON').length}</p>
            </div>
            {lightingData.length > 0 && (
              <div className="mini-graph-container">
                <GraphComponent type="doughnut" data={lightingStatusData} options={commonChartOptions} height="100px" />
              </div>
            )}
          </div>

          <div className="stat-item hvac-stat-item"> {/* Special class for HVAC if it needs different layout */}
            <h4>💨 HVAC</h4>
             <div className="stat-item-content">
                <p>Zones: {hvacData.length}</p>
                <p>Active: {hvacData.filter(d => d.status === 'ON' || d.status === 'ECO').length}</p>
            </div>
            {hvacData.length > 0 && (
              <div className="mini-graph-container hvac-graph-container">
                <GraphComponent type="bar" data={hvacStatusOverviewData} options={barChartOptions} height="100px" />
              </div>
            )}
          </div>
        </div>
      </div>
      <AwePointsTips />
    </div>
  );
};

export default ConsolidatedStats;