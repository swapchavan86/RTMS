import React, { useState, useEffect } from 'react';
import Leaderboard from '../components/Leaderboard';
import SeatingChart from '../components/SeatingChart';
import EnergyConsumptionCard from '../components/EnergyConsumptionCard'; // Re-using this for stats
import GraphComponent from '../components/GraphComponent'; // To be passed as children
import { getLaptopUsage, getLightingStatus, getHvacStatus } from '../services/api';

const DashboardPage = () => {
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
        // Fetch all data in parallel
        const [laptopRes, lightingRes, hvacRes] = await Promise.all([
          getLaptopUsage(),
          getLightingStatus(),
          getHvacStatus()
        ]);
        setLaptopData(laptopRes.data || []);
        setLightingData(lightingRes.data || []);
        setHvacData(hvacRes.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch energy stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllStatsData();
  }, []);

  // --- Chart Data Preparation ---

  const laptopUsageModeData = {
    labels: ['Light Mode', 'Dark Mode'],
    datasets: [{
      label: 'Laptop Usage Mode',
      data: [
        laptopData.filter(d => d.mode === 'Light Mode').length,
        laptopData.filter(d => d.mode === 'Dark Mode').length,
      ],
    }],
  };
  
  const lightingStatusData = {
    labels: ['ON', 'OFF'],
    datasets: [{
      label: 'Lighting Status',
      data: [
        lightingData.filter(d => d.status === 'ON').length,
        lightingData.filter(d => d.status === 'OFF').length,
      ],
    }],
  };

  const hvacStatusOverviewData = {
    labels: ['ON', 'ECO', 'OFF'],
    datasets: [{
      label: 'HVAC Status',
      data: [
        hvacData.filter(d => d.status === 'ON').length,
        hvacData.filter(d => d.status === 'ECO').length,
        hvacData.filter(d => d.status === 'OFF').length,
      ],
    }],
  };
  
  // --- Chart Options ---
  const commonPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  const commonBarOptions = {
    ...commonPieOptions,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } },
  };

  return (
    <div className="App-main-container">
      {/* Column 1: Laptop and Lighting Stats */}
      <div className="dashboard-column">
        <EnergyConsumptionCard
          title="Laptop Usage"
          cardType="laptop"
          loading={loading}
          summaryData={{
            value: (laptopData.reduce((acc, curr) => acc + curr.hours_on, 0) / (laptopData.length || 1)).toFixed(1) + 'h',
            label: 'Avg Daily Use'
          }}
        >
          <GraphComponent type="doughnut" data={laptopUsageModeData} options={commonPieOptions} />
        </EnergyConsumptionCard>
        
        <EnergyConsumptionCard
          title="Lighting Status"
          cardType="lighting"
          loading={loading}
          summaryData={{
            value: lightingData.filter(d => d.status === 'ON').length,
            label: 'Zones ON'
          }}
        >
          <GraphComponent type="pie" data={lightingStatusData} options={commonPieOptions} />
        </EnergyConsumptionCard>
      </div>

      {/* Column 2: Leaderboard and HVAC */}
      <div className="dashboard-column">
        <Leaderboard />
        <EnergyConsumptionCard
          title="HVAC Status"
          cardType="hvac"
          loading={loading}
          summaryData={{
            value: hvacData.filter(d => d.status !== 'OFF').length,
            label: 'Active Zones'
          }}
        >
          <GraphComponent type="bar" data={hvacStatusOverviewData} options={commonBarOptions} />
        </EnergyConsumptionCard>
      </div>

      {/* Column 3: Seating Chart */}
      <div className="dashboard-column col-3">
        <SeatingChart />
      </div>
    </div>
  );
};

export default DashboardPage;