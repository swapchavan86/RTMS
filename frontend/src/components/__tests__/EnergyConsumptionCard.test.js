// EnergyConsumptionCard.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnergyConsumptionCard from '../EnergyConsumptionCard';
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('EnergyConsumptionCard Component', () => {
  const testData = [
    { name: 'Laptop A', value: 50 },
    { name: 'Laptop B', value: 75, details: 'eco mode' },
  ];

  test('renders data items with name, value, and unit', () => {
    render(<EnergyConsumptionCard title="Laptop Power" data={testData} unit="Watts" />);
    expect(screen.getByText('Laptop A')).toBeInTheDocument();
    expect(screen.getByText('Laptop B')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getAllByText('Watts')).toHaveLength(2);
    expect(screen.getByText('eco mode')).toBeInTheDocument();
  });

  test('renders data items without name if not provided', () => {
    const unnamedData = [{ value: 100 }, { value: 200, details: 'peak hours' }];
    render(<EnergyConsumptionCard title="Total Consumption" data={unnamedData} unit="kWh" />);
    expect(screen.getAllByText('kWh')).toHaveLength(2);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('peak hours')).toBeInTheDocument();
  });

  test('renders "No data available" when no data and no children are provided', () => {
    render(<EnergyConsumptionCard title="Empty Card" />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  test('does not render "No data available" if only children are provided', () => {
    render(<EnergyConsumptionCard title="Only Children">{<div>Child content</div>}</EnergyConsumptionCard>);
    expect(screen.queryByText(/No data available/i)).not.toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('does not render "No data available" if only data is provided', () => {
    render(<EnergyConsumptionCard title="Data Only" data={[{ name: 'Item', value: '5' }]} unit="U" />);
    expect(screen.queryByText(/No data available/i)).not.toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });
});
