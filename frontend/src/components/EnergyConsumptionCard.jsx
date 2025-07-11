import React from 'react';

const EnergyConsumptionCard = ({ 
  title, 
  cardType, // e.g., 'laptop', 'lighting', 'hvac'
  children, // This will be the GraphComponent
  loading = false,
  summaryData = null // e.g., { value: '5.4h', label: 'Avg Daily Use' }
}) => {
  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="loading-shimmer" style={{ height: '300px' }}></div>
      </div>
    );
  }

  return (
    <div className={`dashboard-section energy-card ${cardType}`}>
      <h2 className="h2-style">{title}</h2>
      
      {summaryData && (
        <div className="energy-card-summary">
          <div>
            <div className="summary-value">{summaryData.value}</div>
            <div className="summary-label">{summaryData.label}</div>
          </div>
          {/* Can add more summary items here if needed */}
        </div>
      )}
      
      <div className="graph-container-wrapper">
        {children}
      </div>
    </div>
  );
};

export default EnergyConsumptionCard;