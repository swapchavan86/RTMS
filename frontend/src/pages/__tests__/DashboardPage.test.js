import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../DashboardPage';
import * as api from '../../services/api';

// Mock child components to simplify testing of DashboardPage itself
jest.mock('../../components/Leaderboard', () => () => <div data-testid="leaderboard-mock">Leaderboard Mock</div>);
jest.mock('../../components/EnergyConsumptionCard', () => ({ title, children }) => (
  <div data-testid={`energy-card-mock-${title?.toLowerCase().replace(/\s+/g, '-')}`}>
    <h3>{title}</h3>
    {children}
  </div>
));
jest.mock('../../components/SeatingChart', () => () => <div data-testid="seating-chart-mock">Seating Chart Mock</div>);
jest.mock('../../components/GraphComponent', () => ({ type, title }) => <div data-testid={`graph-mock-${type}-${title?.toLowerCase().replace(/\s+/g, '-')}`}>Graph: {title}</div>);

// Mock the api module
jest.mock('../../services/api');

describe('DashboardPage Component', () => {
  const mockLaptopData = [{ employee_id: 'emp001', hours_on: 8, mode: 'Dark Mode' }];
  const mockLightingData = [{ zone_id: 'ZoneA', status: 'ON' }];
  const mockHvacData = [{ zone_id: 'ZoneA', status: 'ON', current_temp_celsius: 22, set_point_celsius: 23 }];

  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful API responses
    api.getLaptopUsage.mockResolvedValue({ data: mockLaptopData });
    api.getLightingStatus.mockResolvedValue({ data: mockLightingData });
    api.getHvacStatus.mockResolvedValue({ data: mockHvacData });
    // SeatingChart and Leaderboard make their own calls, but they are mocked components here.
    // If we weren't mocking SeatingChart/Leaderboard, we'd mock their API calls too.
  });

  test('renders loading state initially', () => {
    // Prevent API calls from resolving immediately
    api.getLaptopUsage.mockImplementation(() => new Promise(() => {}));
    api.getLightingStatus.mockImplementation(() => new Promise(() => {}));
    api.getHvacStatus.mockImplementation(() => new Promise(() => {}));

    render(<DashboardPage />);
    expect(screen.getByText(/Loading Dashboard Data... Please wait./i)).toBeInTheDocument();
  });

  test('renders all child components and data sections after successful API calls', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading Dashboard Data... Please wait./i)).not.toBeInTheDocument();
    });

    // Check for mocked child components
    expect(screen.getByTestId('leaderboard-mock')).toBeInTheDocument();
    expect(screen.getByTestId('seating-chart-mock')).toBeInTheDocument();

    // Check for EnergyConsumptionCard sections (identified by their mocked titles)
    expect(screen.getByTestId('energy-card-mock-💻-laptop-usage-stats')).toBeInTheDocument();
    expect(screen.getByTestId('energy-card-mock-💡-lighting-status')).toBeInTheDocument();
    expect(screen.getByTestId('energy-card-mock-❄️🔥-hvac-status')).toBeInTheDocument();
    expect(screen.getByTestId('energy-card-mock-🌟-awe-points-tips')).toBeInTheDocument();

    // Check for GraphComponent mocks within energy cards
    expect(screen.getByTestId('graph-mock-pie-laptop-ui-modes')).toBeInTheDocument();
    expect(screen.getByTestId('graph-mock-doughnut-lighting-zone-status')).toBeInTheDocument();
    expect(screen.getByTestId('graph-mock-bar-hvac-system-status-overview')).toBeInTheDocument();

    // Check if some data from API calls is processed and displayed (e.g., counts)
    // For Laptop Usage
    expect(screen.getByText(/Total Laptops Tracked: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Average Hours On: 8.0 hrs/i)).toBeInTheDocument();
    // For Lighting
    expect(screen.getByText(/Total Lighting Zones Tracked: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Zones with Lights ON: 1/i)).toBeInTheDocument();
    // For HVAC
    expect(screen.getByText(/Total HVAC Zones Tracked: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Zones with HVAC Active \(ON\/ECO\): 1/i)).toBeInTheDocument();


    // Verify API calls made by DashboardPage
    expect(api.getLaptopUsage).toHaveBeenCalledTimes(1);
    expect(api.getLightingStatus).toHaveBeenCalledTimes(1);
    expect(api.getHvacStatus).toHaveBeenCalledTimes(1);
  });

  test('renders error message if any primary API call fails', async () => {
    api.getLaptopUsage.mockRejectedValueOnce(new Error('Failed to fetch laptop data'));
    // Other calls might succeed or fail, but one failure should show the error.
    api.getLightingStatus.mockResolvedValue({ data: mockLightingData });
    api.getHvacStatus.mockResolvedValue({ data: mockHvacData });


    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading Dashboard Data... Please wait./i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error loading dashboard: Failed to fetch laptop data/i)).toBeInTheDocument();
  });

  test('correctly calculates averages and counts with empty data', async () => {
    api.getLaptopUsage.mockResolvedValue({ data: [] });
    api.getLightingStatus.mockResolvedValue({ data: [] });
    api.getHvacStatus.mockResolvedValue({ data: [] });

    render(<DashboardPage />);
    await waitFor(() => expect(screen.queryByText(/Loading Dashboard Data.../i)).not.toBeInTheDocument());

    expect(screen.getByText(/Total Laptops Tracked: 0/i)).toBeInTheDocument();
    // Test for toFixed(1) on NaN or Infinity if laptopData.length is 0. The component uses (laptopData.length || 1) to prevent division by zero.
    expect(screen.getByText(/Average Hours On: 0.0 hrs/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Lighting Zones Tracked: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Zones with Lights ON: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Total HVAC Zones Tracked: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Zones with HVAC Active \(ON\/ECO\): 0/i)).toBeInTheDocument();
  });
});
```
