import React, { useState } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GraphComponent = ({ 
  type = 'bar', 
  data, 
  options, 
  title, 
  height = '300px',
  loading = false,
  error = null,
  theme = 'light',
  showControls = false,
  onChartTypeChange,
  className = ''
}) => {
  const [currentType, setCurrentType] = useState(type);
  const [isAnimating, setIsAnimating] = useState(false);

  // CSS custom properties for theming
  const cssVars = {
    '--primary-color': '#2563eb',
    '--secondary-color': '#10b981',
    '--accent-color': '#f59e0b',
    '--text-color': '#1f2937',
    '--text-color-light': '#6b7280',
    '--background-color': '#ffffff',
    '--border-color': '#e5e7eb'
  };

  // Enhanced default options that align with your CSS design system
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
      onComplete: () => setIsAnimating(false),
      onProgress: () => setIsAnimating(true)
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            size: 12,
            weight: '500'
          },
          color: cssVars['--text-color']
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          size: 16,
          weight: '600'
        },
        color: cssVars['--text-color'],
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: cssVars['--text-color'],
        bodyColor: cssVars['--text-color-light'],
        borderColor: cssVars['--border-color'],
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: 'Inter',
          size: 12,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: 11,
          weight: '400'
        },
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    },
    scales: {
      x: {
        grid: {
          color: cssVars['--border-color'],
          lineWidth: 1
        },
        ticks: {
          color: cssVars['--text-color-light'],
          font: {
            family: 'Inter',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: cssVars['--border-color'],
          lineWidth: 1
        },
        ticks: {
          color: cssVars['--text-color-light'],
          font: {
            family: 'Inter',
            size: 11
          }
        }
      }
    }
  };

  // Enhanced data with CSS-aligned colors
  const enhanceDataWithTheme = (chartData) => {
    if (!chartData || !chartData.datasets) return chartData;

    const colorPalette = [
      cssVars['--primary-color'],
      cssVars['--secondary-color'],
      cssVars['--accent-color'],
      '#ef4444', // error color
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16'  // lime
    ];

    const enhancedData = { ...chartData };
    enhancedData.datasets = chartData.datasets.map((dataset, index) => {
      const baseColor = colorPalette[index % colorPalette.length];
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || `${baseColor}20`,
        borderColor: dataset.borderColor || baseColor,
        borderWidth: dataset.borderWidth || 2,
        borderRadius: dataset.borderRadius || 4,
        tension: dataset.tension || 0.4, // for line charts
        pointBackgroundColor: dataset.pointBackgroundColor || baseColor,
        pointBorderColor: dataset.pointBorderColor || '#ffffff',
        pointBorderWidth: dataset.pointBorderWidth || 2,
        pointRadius: dataset.pointRadius || 4,
        pointHoverRadius: dataset.pointHoverRadius || 6,
        hoverBackgroundColor: dataset.hoverBackgroundColor || `${baseColor}40`,
        hoverBorderColor: dataset.hoverBorderColor || baseColor,
        hoverBorderWidth: dataset.hoverBorderWidth || 3
      };
    });

    return enhancedData;
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const enhancedData = enhanceDataWithTheme(data);

  const handleTypeChange = (newType) => {
    setCurrentType(newType);
    if (onChartTypeChange) {
      onChartTypeChange(newType);
    }
  };

  const renderChart = () => {
    if (!enhancedData) return null;

    switch (currentType.toLowerCase()) {
      case 'bar':
        return <Bar data={enhancedData} options={mergedOptions} />;
      case 'line':
        return <Line data={enhancedData} options={mergedOptions} />;
      case 'pie':
        return <Pie data={enhancedData} options={mergedOptions} />;
      case 'doughnut':
        return <Doughnut data={enhancedData} options={mergedOptions} />;
      default:
        console.warn(`GraphComponent: Unknown chart type "${currentType}". Defaulting to Bar chart.`);
        return <Bar data={enhancedData} options={mergedOptions} />;
    }
  };

  const renderControls = () => {
    if (!showControls) return null;

    const chartTypes = [
      { type: 'bar', label: 'Bar', icon: '📊' },
      { type: 'line', label: 'Line', icon: '📈' },
      { type: 'pie', label: 'Pie', icon: '🥧' },
      { type: 'doughnut', label: 'Doughnut', icon: '🍩' }
    ];

    return (
      <div className="graph-controls" style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {chartTypes.map((chartType) => (
          <button
            key={chartType.type}
            onClick={() => handleTypeChange(chartType.type)}
            className={`graph-control-btn ${currentType === chartType.type ? 'active' : ''}`}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: currentType === chartType.type ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
              background: currentType === chartType.type ? 'var(--primary-color)' : 'white',
              color: currentType === chartType.type ? 'white' : 'var(--text-color)',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{chartType.icon}</span>
            {chartType.label}
          </button>
        ))}
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="graph-loading" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div className="loading-shimmer" style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
        backgroundSize: '400% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite'
      }}></div>
      <p style={{ color: 'var(--text-color-light)', fontSize: '14px', margin: 0 }}>
        Loading chart data...
      </p>
    </div>
  );

  const renderErrorState = () => (
    <div className="graph-error" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'column',
      gap: '16px',
      color: 'var(--error-color)',
      textAlign: 'center'
    }}>
      <span style={{ fontSize: '48px' }}>⚠️</span>
      <div>
        <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Failed to load chart</p>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-color-light)' }}>
          {error || 'An unexpected error occurred'}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`graph-container ${className} ${isAnimating ? 'animating' : ''}`} 
         style={{ 
           position: 'relative', 
           height: height, 
           width: '100%',
           transition: 'all 0.3s ease'
         }}>
      {renderControls()}
      
      {loading ? renderLoadingState() : 
       error ? renderErrorState() : 
       renderChart()}
    </div>
  );
};

export default GraphComponent;