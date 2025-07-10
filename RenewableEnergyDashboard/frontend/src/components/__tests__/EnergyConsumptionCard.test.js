import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnergyConsumptionCard from '../EnergyConsumptionCard';

describe('EnergyConsumptionCard Component', () => {
  test('renders title correctly', () => {
    render(<EnergyConsumptionCard title="Test Title" data={[{ name: 'Item 1', value: '10' }]} unit="kWh" />);
    expect(screen.getByRole('heading', { name: /Test Title/i })).toBeInTheDocument();
  });

  test('renders data items with name, value, and unit', () => {
    const testData = [
      { name: 'Laptop A', value: '50' },
      { name: 'Laptop B', value: '75', details: 'eco mode' },
    ];
    render(<EnergyConsumptionCard title="Laptop Power" data={testData} unit="Watts" />);

    expect(screen.getByText(/Laptop A: 50 Watts/i)).toBeInTheDocument();
    expect(screen.getByText(/Laptop B: 75 Watts \(eco mode\)/i)).toBeInTheDocument();
  });

  test('renders data items without name if not provided', () => {
    const testData = [
      { value: '100' },
      { value: '200', details: 'peak hours' },
    ];
    render(<EnergyConsumptionCard title="Total Consumption" data={testData} unit="kWh" />);

    // Check for value and unit directly
    expect(screen.getByText((content, element) => {
      return element.textContent.trim() === '100 kWh';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element.textContent.trim() === '200 kWh (peak hours)';
    })).toBeInTheDocument();
  });

  test('renders children when provided', () => {
    render(
      <EnergyConsumptionCard title="Custom Content">
        <p>This is a child paragraph.</p>
        <button>Click Me</button>
      </EnergyConsumptionCard>
    );
    expect(screen.getByText(/This is a child paragraph./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
  });

  test('renders "No data available" when no data and no children are provided', () => {
    render(<EnergyConsumptionCard title="Empty Card" />);
    expect(screen.getByText(/No data available./i)).toBeInTheDocument();
  });

  test('does not render "No data available" if only children are provided', () => {
    render(
      <EnergyConsumptionCard title="Child Only">
        <p>Only child content here.</p>
      </EnergyConsumptionCard>
    );
    expect(screen.queryByText(/No data available./i)).not.toBeInTheDocument();
    expect(screen.getByText(/Only child content here./i)).toBeInTheDocument();
  });

  test('does not render "No data available" if only data is provided', () => {
    render(<EnergyConsumptionCard title="Data Only" data={[{ name: 'Item', value: '5' }]} unit="U" />);
    expect(screen.queryByText(/No data available./i)).not.toBeInTheDocument();
    expect(screen.getByText(/Item: 5 U/i)).toBeInTheDocument();
  });
});
```
