import React, { useState, useEffect } from 'react';
import Leaderboard from '../components/Leaderboard';
import EnergyConsumptionCard from '../components/EnergyConsumptionCard';
import SeatingChart from '../components/SeatingChart';
import GraphComponent from '../components/GraphComponent';

import {
    getLaptopUsage,
    getLightingStatus,
    getHvacStatus
} from '../services/api';

const DashboardPage = () => {
  const [laptopData, setLaptopData] = useState([]);
  const [lightingData, setLightingData] = useState([]);
  const [hvacData, setHvacData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [laptopRes, lightingRes, hvacRes] = await Promise.all([
          getLaptopUsage(),
          getLightingStatus(),
          getHvacStatus()
        ]);

        setLaptopData(laptopRes.data);
        setLightingData(lightingRes.data);
        setHvacData(hvacRes.data);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch some dashboard data. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Prepare data for graphs
  const laptopUsageModeData = {
    labels: ['Light Mode', 'Dark Mode'],
    datasets: [
      {
        label: 'Laptop Mode Distribution',
        data: [
          laptopData.filter(d => d.mode === 'Light Mode').length,
          laptopData.filter(d => d.mode === 'Dark Mode').length,
        ],
        backgroundColor: ['rgba(255, 206, 86, 0.5)', 'rgba(54, 162, 235, 0.5)'],
        borderColor: ['rgba(255, 206, 86, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const lightingStatusData = {
    labels: ['Lights ON', 'Lights OFF'],
    datasets: [
      {
        label: 'Lighting Status',
        data: [
          lightingData.filter(d => d.status === 'ON').length,
          lightingData.filter(d => d.status === 'OFF').length,
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(201, 203, 207, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(201, 203, 207, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const hvacStatusOverviewData = {
    labels: ['HVAC ON', 'HVAC ECO', 'HVAC OFF'],
    datasets: [
        {
            label: 'HVAC System Status',
            data: [
                hvacData.filter(d => d.status === 'ON').length,
                hvacData.filter(d => d.status === 'ECO').length,
                hvacData.filter(d => d.status === 'OFF').length,
            ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(201, 203, 207, 0.5)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(201, 203, 207, 1)'
            ],
            borderWidth: 1,
        },
    ],
  };

  if (loading) {
    return (
      <div className="dashboard-section loading-shimmer" style={{
        padding: 'var(--spacing-xl)',
        margin: 'var(--spacing-xl)',
        borderRadius: 'var(--border-radius-xl)',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading Dashboard Data... Please wait.
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-section" style={{
        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
        borderLeft: '4px solid var(--error-color)',
        padding: 'var(--spacing-xl)',
        margin: 'var(--spacing-xl)',
        borderRadius: 'var(--border-radius-xl)'
      }}>
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="App-main-container">
      <div className="App-left-column">
        {/* Laptop Usage Section */}
        <EnergyConsumptionCard title="💻 Laptop Usage Stats" className="dashboard-section">
          <div className="energy-item">
            <span className="item-name">Total Laptops Tracked:</span>
            <span className="item-value">{laptopData.length}</span>
          </div>
          <div className="energy-item">
            <span className="item-name">Average Hours On:</span>
            <span className="item-value">
              {(laptopData.reduce((acc, curr) => acc + curr.hours_on, 0) / (laptopData.length || 1)).toFixed(1)} hrs
            </span>
          </div>
          {laptopData.length > 0 && (
            <div className="graph-container">
              <GraphComponent type="pie" data={laptopUsageModeData} title="Laptop UI Modes" />
            </div>
          )}
        </EnergyConsumptionCard>

        {/* Lighting Section */}
        <EnergyConsumptionCard title="💡 Lighting Status" className="dashboard-section">
          <div className="energy-item">
            <span className="item-name">Total Lighting Zones Tracked:</span>
            <span className="item-value">{lightingData.length}</span>
          </div>
          <div className="energy-item">
            <span className="item-name">Zones with Lights ON:</span>
            <span className="item-value">
              {lightingData.filter(d => d.status === 'ON').length}
            </span>
          </div>
          {lightingData.length > 0 && (
            <div className="graph-container">
              <GraphComponent type="doughnut" data={lightingStatusData} title="Lighting Zone Status" />
            </div>
          )}
        </EnergyConsumptionCard>

        {/* HVAC Section */}
        <EnergyConsumptionCard title="❄️🔥 HVAC Status" className="dashboard-section">
          <div className="energy-item">
            <span className="item-name">Total HVAC Zones Tracked:</span>
            <span className="item-value">{hvacData.length}</span>
          </div>
          <div className="energy-item">
            <span className="item-name">Zones with HVAC Active (ON/ECO):</span>
            <span className="item-value">
              {hvacData.filter(d => d.status === 'ON' || d.status === 'ECO').length}
            </span>
          </div>
          {hvacData.length > 0 && (
            <div className="graph-container">
              <GraphComponent
                type="bar"
                data={hvacStatusOverviewData}
                title="HVAC System Status Overview"
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Zones'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Status'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      enabled: true,
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.x !== null) {
                            label += context.parsed.x + (context.parsed.x === 1 ? ' zone' : ' zones');
                          }
                          return label;
                        }
                      }
                    },
                  },
                  hover: {
                    mode: 'nearest',
                    intersect: true,
                    animationDuration: 400
                  },
                  animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                  }
                }}
              />
            </div>
          )}
        </EnergyConsumptionCard>

        {/* Seating Chart Section */}
        <SeatingChart className="seating-section dashboard-section" />
      </div>

      <div className="App-right-column">
        <Leaderboard className="leaderboard-section dashboard-section" />
        <EnergyConsumptionCard title="🌟 Awe Points Tips" className="dashboard-section">
          <ul>
            <li>Use Dark Mode on your laptop.</li>
            <li>Participate in seat consolidation.</li>
            <li>Turn off lights in unused meeting rooms.</li>
            <li>Report energy wastage.</li>
          </ul>
        </EnergyConsumptionCard>
      </div>
    </div>
  );
};

export default DashboardPage;