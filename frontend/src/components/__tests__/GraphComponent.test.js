import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphComponent from '../GraphComponent';

// Mock react-chartjs-2 components
// We are not testing the chart library itself, just that our component uses it.
jest.mock('react-chartjs-2', () => ({
  Bar: jest.fn(() => <div data-testid="bar-chart-mock" />),
  Line: jest.fn(() => <div data-testid="line-chart-mock" />),
  Pie: jest.fn(() => <div data-testid="pie-chart-mock" />),
  Doughnut: jest.fn(() => <div data-testid="doughnut-chart-mock" />),
}));

// Mock ChartJS registration (not strictly necessary with component mocks but good practice)
jest.mock('chart.js', () => ({
  ...jest.requireActual('chart.js'), // Import and retain default behavior
  Chart: {
    register: jest.fn(),
  },
  // Mock scales and elements if they were directly used or caused issues
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  LineElement: jest.fn(),
  PointElement: jest.fn(),
  ArcElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn()
}));


describe('GraphComponent', () => {
  const mockData = {
    labels: ['A', 'B', 'C'],
    datasets: [{
      label: 'Sample Data',
      data: [10, 20, 30],
      backgroundColor: 'rgba(75,192,192,0.5)',
    }],
  };

  const mockOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  beforeEach(() => {
    // Clear mock calls before each test
    require('react-chartjs-2').Bar.mockClear();
    require('react-chartjs-2').Line.mockClear();
    require('react-chartjs-2').Pie.mockClear();
    require('react-chartjs-2').Doughnut.mockClear();
  });

  test('renders a Bar chart by default', () => {
    render(<GraphComponent data={mockData} options={mockOptions} title="Bar Chart" />);
    expect(screen.getByTestId('bar-chart-mock')).toBeInTheDocument();
    expect(require('react-chartjs-2').Bar).toHaveBeenCalledTimes(1);
    // Check if title is somehow passed (though options merge in component)
    // We can check if the Bar mock was called with options that include the title.
    const BarMock = require('react-chartjs-2').Bar;
    const passedProps = BarMock.mock.calls[0][0]; // Get props of the first call
    expect(passedProps.options.plugins.title.text).toBe("Bar Chart");
    expect(passedProps.options.plugins.title.display).toBe(true);

  });

  test('renders a Line chart when type="line" is specified', () => {
    render(<GraphComponent type="line" data={mockData} options={mockOptions} title="Line Chart" />);
    expect(screen.getByTestId('line-chart-mock')).toBeInTheDocument();
    expect(require('react-chartjs-2').Line).toHaveBeenCalledTimes(1);
  });

  test('renders a Pie chart when type="pie" is specified', () => {
    render(<GraphComponent type="pie" data={mockData} options={mockOptions} title="Pie Chart" />);
    expect(screen.getByTestId('pie-chart-mock')).toBeInTheDocument();
    expect(require('react-chartjs-2').Pie).toHaveBeenCalledTimes(1);
  });

  test('renders a Doughnut chart when type="doughnut" is specified', () => {
    render(<GraphComponent type="doughnut" data={mockData} options={mockOptions} title="Doughnut Chart" />);
    expect(screen.getByTestId('doughnut-chart-mock')).toBeInTheDocument();
    expect(require('react-chartjs-2').Doughnut).toHaveBeenCalledTimes(1);
  });

  test('defaults to Bar chart for an unknown type and logs a warning', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<GraphComponent type="unknown" data={mockData} options={mockOptions} title="Unknown Chart" />);
    expect(screen.getByTestId('bar-chart-mock')).toBeInTheDocument();
    expect(require('react-chartjs-2').Bar).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith('GraphComponent: Unknown chart type "unknown". Defaulting to Bar chart.');
    consoleWarnSpy.mockRestore();
  });

  test('merges default options with provided options', () => {
    render(<GraphComponent data={mockData} options={{ plugins: { legend: { position: 'bottom' } } }} title="Test Options" />);
    const BarMock = require('react-chartjs-2').Bar;
    const passedProps = BarMock.mock.calls[0][0];

    // Check that default 'responsive: true' is still there
    expect(passedProps.options.responsive).toBe(true);
    // Check that provided option is merged
    expect(passedProps.options.plugins.legend.position).toBe('bottom');
    // Check that title is set
    expect(passedProps.options.plugins.title.text).toBe("Test Options");
  });

  test('does not display title if title prop is not provided', () => {
    render(<GraphComponent data={mockData} options={mockOptions} />);
    const BarMock = require('react-chartjs-2').Bar;
    const passedProps = BarMock.mock.calls[0][0];
    expect(passedProps.options.plugins.title.display).toBe(false);
  });

  test('renders loading state when loading prop is true', () => {
    render(<GraphComponent loading={true} title="Loading Chart" />);
    expect(screen.getByText(/Loading chart data.../i)).toBeInTheDocument();
    // Ensure no chart is rendered
    expect(screen.queryByTestId('bar-chart-mock')).not.toBeInTheDocument();
  });

  test('renders error state when error prop is provided', () => {
    render(<GraphComponent error="Network Error" title="Error Chart" />);
    expect(screen.getByText(/Failed to load chart/i)).toBeInTheDocument();
    expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
    // Ensure no chart is rendered
    expect(screen.queryByTestId('bar-chart-mock')).not.toBeInTheDocument();
  });

  test('renders nothing (or a specific message if implemented) if data is null/undefined and not loading/error', () => {
    const { container } = render(<GraphComponent data={null} title="Empty Chart" />);
    // The component currently returns null if !enhancedData, so chart mocks shouldn't be called.
    expect(screen.queryByTestId('bar-chart-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('line-chart-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('doughnut-chart-mock')).not.toBeInTheDocument();
    // Check if the container is empty or has a specific placeholder if that's the behavior
    // For now, we expect it to not render a chart. If it rendered a "no data" message, we'd test for that.
    // The component's renderChart returns null if !enhancedData, so the graph-container would be empty of charts.
  });

  test('renders chart type controls when showControls is true and allows type change', () => {
    const handleChartTypeChange = jest.fn();
    render(
      <GraphComponent
        data={mockData}
        options={mockOptions}
        title="Controllable Chart"
        showControls={true}
        onChartTypeChange={handleChartTypeChange}
      />
    );

    // Check if controls are rendered
    expect(screen.getByRole('button', { name: /📊 Bar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /📈 Line/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🥧 Pie/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🍩 Doughnut/i })).toBeInTheDocument();

    // Default is Bar
    expect(require('react-chartjs-2').Bar).toHaveBeenCalledTimes(1);
    expect(require('react-chartjs-2').Line).not.toHaveBeenCalled();

    // Click Line button
    screen.getByRole('button', { name: /📈 Line/i }).click();

    // Check if Line chart is now rendered (mock should be called again)
    // Note: Since we mock the chart components, we check if the mock was called.
    // The actual DOM update to show 'line-chart-mock' depends on how state updates trigger re-renders
    // and if the mock components themselves are stateful or just placeholders.
    // For this test, we'll assume clicking updates internal state and attempts to render the new type.
    expect(require('react-chartjs-2').Line).toHaveBeenCalledTimes(1);
    expect(handleChartTypeChange).toHaveBeenCalledWith('line');

    // Click Pie button
    screen.getByRole('button', { name: /🥧 Pie/i }).click();
    expect(require('react-chartjs-2').Pie).toHaveBeenCalledTimes(1);
    expect(handleChartTypeChange).toHaveBeenCalledWith('pie');
  });

});
```
