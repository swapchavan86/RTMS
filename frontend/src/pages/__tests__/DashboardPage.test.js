import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as api from '../../services/api';
import DashboardPage from '../DashboardPage';

jest.mock('../../services/api');
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeAll(() => {
  // Mock canvas context to avoid chart.js errors
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({}));
});

const mockLaptopData = {
  data: [{ id: 1, usage: 50 }, { id: 2, usage: 40 }],
};
const mockLightingData = {
  data: [{ id: 1, status: 'ON' }, { id: 2, status: 'OFF' }],
};
const mockHVACData = {
  data: [{ id: 1, status: 'Cooling' }, { id: 2, status: 'Heating' }],
};

describe('DashboardPage Component', () => {
  beforeEach(() => {
    api.getLaptopUsage.mockResolvedValue(mockLaptopData);
    api.getLightingStatus.mockResolvedValue(mockLightingData);
    api.getHvacStatus.mockResolvedValue(mockHVACData);
  });

  test('renders all mock components correctly', async () => {
    await act(async () => {
      render(<DashboardPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/💻 Laptop Usage Stats/i)).toBeInTheDocument();
      expect(screen.getByText(/💡 Lighting Status/i)).toBeInTheDocument();
      expect(screen.getByText(/❄️🔥 HVAC Status/i)).toBeInTheDocument();
    });
  });

  test('shows error if API fails', async () => {
    api.getLaptopUsage.mockRejectedValueOnce(new Error('Failed'));
    api.getLightingStatus.mockRejectedValueOnce(new Error('Failed'));
    api.getHvacStatus.mockRejectedValueOnce(new Error('Failed'));

    await act(async () => {
      render(<DashboardPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard/i)).toBeInTheDocument();
    });
  });
});
