import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphComponent from '../GraphComponent';

// Mock react-chartjs-2 components
jest.mock('react-chartjs-2', () => ({
  Bar: (props) => <div data-testid="bar-chart-mock">Bar Chart</div>,
  Line: (props) => <div data-testid="line-chart-mock">Line Chart</div>,
  Pie: (props) => <div data-testid="pie-chart-mock">Pie Chart</div>,
  Doughnut: (props) => <div data-testid="doughnut-chart-mock">Doughnut Chart</div>,
}));

describe('GraphComponent', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{ label: 'Sales', data: [30, 20, 50] }],
  };
  const mockOptions = { responsive: true };

  test('renders a Bar chart by default', () => {
    render(<GraphComponent data={mockData} options={mockOptions} title="Bar Chart" />);
    expect(screen.getByTestId('bar-chart-mock')).toBeInTheDocument();
  });

  test('renders a Line chart when type="line" is specified', () => {
    render(<GraphComponent type="line" data={mockData} options={mockOptions} title="Line Chart" />);
    expect(screen.getByTestId('line-chart-mock')).toBeInTheDocument();
  });

  test('renders a Pie chart when type="pie" is specified', () => {
    render(<GraphComponent type="pie" data={mockData} options={mockOptions} title="Pie Chart" />);
    expect(screen.getByTestId('pie-chart-mock')).toBeInTheDocument();
  });

  test('renders a Doughnut chart when type="doughnut" is specified', () => {
    render(<GraphComponent type="doughnut" data={mockData} options={mockOptions} title="Doughnut Chart" />);
    expect(screen.getByTestId('doughnut-chart-mock')).toBeInTheDocument();
  });

  test('defaults to Bar chart for unknown type and logs a warning', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<GraphComponent type="unknown" data={mockData} options={mockOptions} title="Unknown Chart" />);
    expect(screen.getByTestId('bar-chart-mock')).toBeInTheDocument();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'GraphComponent: Unknown chart type "unknown". Defaulting to Bar chart.'
    );
    consoleWarnSpy.mockRestore();
  });

  test('renders chart type controls and handles chart type switch', () => {
    const handleChartTypeChange = jest.fn();
    render(
      <GraphComponent
        showControls
        data={mockData}
        options={mockOptions}
        title="Controlled Chart"
        onChartTypeChange={handleChartTypeChange}
      />
    );

    // Click 'Line' button to change chart type
    fireEvent.click(screen.getByText('Line'));
    expect(screen.getByTestId('line-chart-mock')).toBeInTheDocument();
    expect(handleChartTypeChange).toHaveBeenCalledWith('line');
  });
});
