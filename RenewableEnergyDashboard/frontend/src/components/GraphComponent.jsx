import React from 'react';
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

const GraphComponent = ({ type = 'bar', data, options, title }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important for sizing within a flex container
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16
        }
      },
    },
    // Add other common options here if needed
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'bar':
        return <Bar data={data} options={mergedOptions} />;
      case 'line':
        return <Line data={data} options={mergedOptions} />;
      case 'pie':
        return <Pie data={data} options={mergedOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={mergedOptions} />;
      default:
        console.warn(`GraphComponent: Unknown chart type "${type}". Defaulting to Bar chart.`);
        return <Bar data={data} options={mergedOptions} />;
    }
  };

  return (
    <div className="graph-container" style={{ position: 'relative', height: '300px', width: '100%'}}> {/* Ensure container has dimensions */}
      {renderChart()}
    </div>
  );
};

export default GraphComponent;
