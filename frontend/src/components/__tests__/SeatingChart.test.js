import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import * as api from '../../services/api';
import SeatingChart from '../SeatingChart';
import '@testing-library/jest-dom';

jest.mock('../../services/api');
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const mockData = {
  data: {
    zones: [
      {
        zone_id: 'Z1',
        grid_rows: 2,
        grid_cols: 2,
        seats: [
          { seat_id: 'Z1-R1C1', status: 'occupied', employee_id: 'emp001' },
          { seat_id: 'Z1-R1C2', status: 'unoccupied' },
          { seat_id: 'Z1-R2C1', status: 'unoccupied' },
        ]
      }
    ],
    total_seats: 3,
    occupied_seats: 1,
    unoccupied_seats: 2,
  }
};
const mockSuggestions = {
  data: {
    suggested_moves: [['emp001', 'Z1-R1C2', 1.5]],
    message: 'Move recommended for energy savings.',
    estimated_energy_saving_kwh: 1.5
  }
};

const seatingLayoutMock = {
  data: {
    layout: {
      Z1: {
        R1: ['Z1-R1C1', 'Z1-R1C2'],
        R2: ['Z1-R2C1'],
      },
    },
    employees: {
      emp001: { name: 'John', seatId: 'Z1-R1C1' },
    },
  },
};

const suggestionsMock = {
  data: {
    suggested_moves: [['emp001', 'Z1-R1C2', 1.5]],
  },
};

describe('SeatingChart Component', () => {
  test('renders seating zones with suggestions', async () => {
    api.getSeatingArrangement.mockResolvedValue(mockData);
    api.getSeatingSuggestions.mockResolvedValue(mockSuggestions);

    await act(async () => {
      render(<SeatingChart />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Move emp001 to Z1-R1C2/i)).toBeInTheDocument();
      expect(screen.getByText(/\(Est. Savings: 1.5 kWh\)/i)).toBeInTheDocument();
    });
  });

  test('handles API failure gracefully', async () => {
    api.getSeatingArrangement.mockRejectedValue(new Error('API Error'));
    api.getSeatingSuggestions.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<SeatingChart />);
    });

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });
});
