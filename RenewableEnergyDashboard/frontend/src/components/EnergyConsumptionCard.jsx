import React from 'react';
const EnergyConsumptionCard = ({ 
  title, 
  data, 
  unit, 
  children, 
  icon, 
  cardType = 'default',
  showHeader = true,
  loading = false 
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="dashboard-section energy-card loading-shimmer">
        <div style={{ height: '24px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '16px' }}></div>
        <div style={{ height: '20px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ height: '20px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ height: '20px', background: '#f0f0f0', borderRadius: '4px' }}></div>
      </div>
    );
  }

  // No data state
  if (!data && !children) {
    return (
      <div className="dashboard-section energy-card">
        {showHeader && (
          <h3>
            {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
            {title}
          </h3>
        )}
        <div className="energy-item" style={{ 
          textAlign: 'center', 
          padding: '32px 16px',
          color: 'var(--text-color-muted)',
          fontStyle: 'italic'
        }}>
          <span className="item-name">No data available</span>
        </div>
      </div>
    );
  }

  // Get card-specific classes based on type
  const getCardClasses = () => {
    const baseClasses = 'dashboard-section energy-card';
    switch (cardType) {
      case 'primary':
        return `${baseClasses} energy-card-primary`;
      case 'secondary':
        return `${baseClasses} energy-card-secondary`;
      case 'success':
        return `${baseClasses} energy-card-success`;
      case 'warning':
        return `${baseClasses} energy-card-warning`;
      case 'danger':
        return `${baseClasses} energy-card-danger`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={getCardClasses()}>
      {showHeader && (
        <h3>
          {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
          {title}
        </h3>
      )}
      
      {data && (
        <div className="energy-metrics">
          {data.map((item, index) => (
            <div key={index} className="energy-item">
              <div>
                {item.name && <span className="item-name">{item.name}</span>}
                {item.details && <div className="item-details">{item.details}</div>}
              </div>
              <div>
                <span className="item-value">
                  {item.value}
                  {unit && <span className="item-unit"> {unit}</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {children && (
        <div className="energy-card-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default EnergyConsumptionCard;