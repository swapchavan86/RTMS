import React from 'react';
// import './EnergyConsumptionCard.css'; // Optional: for specific styling

const EnergyConsumptionCard = ({ title, data, unit, children }) => {
  if (!data && !children) {
    return (
      <div className="dashboard-section energy-card">
        <h3>{title}</h3>
        <p>No data available.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section energy-card">
      <h3>{title}</h3>
      {data && data.map((item, index) => (
        <div key={index} className="energy-item">
          {item.name && <span className="item-name">{item.name}: </span>}
          <span className="item-value">{item.value}</span>
          {unit && <span className="item-unit"> {unit}</span>}
          {item.details && <span className="item-details"> ({item.details})</span>}
        </div>
      ))}
      {children}
    </div>
  );
};

export default EnergyConsumptionCard;
