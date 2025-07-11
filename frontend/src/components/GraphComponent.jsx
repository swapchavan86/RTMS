import React from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const GraphComponent = ({ type = 'bar', data, options }) => {

  // --- NEW VIBRANT COLOR PALETTE ---
  const vibrantColorPalette = [
    '#4f46e5', // Indigo 600
    '#db2777', // Pink 600
    '#16a34a', // Green 600
    '#f59e0b', // Amber 500
    '#0ea5e9', // Sky 500
    '#f43f5e', // Rose 500
    '#8b5cf6', // Violet 500
    '#d946ef', // Fuchsia 500
  ];

  const vibrantBgPalette = vibrantColorPalette.map(c => `${c}33`); // ~20% opacity for bar backgrounds

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeInOutCubic',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#64748b', // Slate 500
          font: { family: "'Inter', sans-serif", size: 12, weight: '500' },
          boxWidth: 12,
          padding: 15,
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1e293b', // Slate 800
        titleColor: '#f1f5f9', // Slate 100
        bodyColor: '#cbd5e1', // Slate 300
        padding: 10,
        cornerRadius: 6,
        titleFont: { size: 14, weight: '600', family: "'Poppins', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" }
      }
    },
    scales: {
      x: {
        grid: { drawOnChartArea: false },
        ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } }
      },
      y: {
        border: { dash: [4, 4] },
        grid: { color: '#e2e8f0' },
        ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } }
      }
    }
  };

  const enhanceDataWithTheme = (chartData) => {
    if (!chartData || !chartData.datasets) return chartData;

    const enhancedData = { ...chartData };
    enhancedData.datasets = chartData.datasets.map((dataset, index) => {
      const isPieOrDoughnut = type === 'pie' || type === 'doughnut';
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || (isPieOrDoughnut ? vibrantColorPalette : vibrantBgPalette[index % vibrantBgPalette.length]),
        borderColor: dataset.borderColor || (isPieOrDoughnut ? '#ffffff' : vibrantColorPalette[index % vibrantColorPalette.length]),
        borderWidth: dataset.borderWidth || (isPieOrDoughnut ? 3 : 2),
        hoverBackgroundColor: dataset.hoverBackgroundColor || vibrantColorPalette,
        borderRadius: type === 'bar' ? 4 : undefined,
        tension: type === 'line' ? 0.4 : undefined,
      };
    });
    return enhancedData;
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  const themedData = enhanceDataWithTheme(data);

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'bar': return <Bar data={themedData} options={mergedOptions} />;
      case 'line': return <Line data={themedData} options={mergedOptions} />;
      case 'pie': return <Pie data={themedData} options={mergedOptions} />;
      case 'doughnut': return <Doughnut data={themedData} options={mergedOptions} />;
      default: return <Bar data={themedData} options={mergedOptions} />;
    }
  };

  return renderChart();
};

export default GraphComponent;