import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SeatingChart from '../SeatingChart';
import * as api from '../../services/api';

jest.mock('../../services/api'); // Mock the entire api module

describe('SeatingChart Component', () => {
  const mockSeatingArrangementData = {
    zones: [
      {
        zone_id: 'ZoneAlpha',
        grid_rows: 2,
        grid_cols: 2,
        seats: [
          { seat_id: 'ZoneAlpha-R1C1', status: 'occupied', employee_id: 'emp101' },
          { seat_id: 'ZoneAlpha-R1C2', status: 'unoccupied', employee_id: null },
          { seat_id: 'ZoneAlpha-R2C1', status: 'unoccupied', employee_id: null },
          { seat_id: 'ZoneAlpha-R2C2', status: 'suggested', employee_id: null }, // Add a suggested seat
        ],
      },
    ],
    total_seats: 4,
    occupied_seats: 1,
    unoccupied_seats: 3,
  };

  const mockSeatingSuggestionsData = {
    message: 'Consider moving emp101 to ZoneAlpha-R2C2.',
    suggested_moves: [['emp101', 'ZoneAlpha-R2C2']],
    estimated_energy_saving_kwh: 1.2,
    vacated_zones_lights_off: [],
    vacated_zones_ac_off: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.getSeatingArrangement.mockResolvedValue({ data: mockSeatingArrangementData });
    api.getSeatingSuggestions.mockResolvedValue({ data: mockSeatingSuggestionsData });
  });

  test('renders loading state initially', () => {
    // Prevent API calls from resolving immediately for this test
    api.getSeatingArrangement.mockImplementation(() => new Promise(() => {}));
    api.getSeatingSuggestions.mockImplementation(() => new Promise(() => {}));
    render(<SeatingChart />);
    expect(screen.getByText(/Loading Seating Chart.../i)).toBeInTheDocument();
  });

  test('renders seating chart and suggestions successfully after loading', async () => {
    render(<SeatingChart />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading Seating Chart.../i)).not.toBeInTheDocument();
    });

    // Check for titles and summary info
    expect(screen.getByRole('heading', { name: /Office Seating Arrangement/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Seats: 4 | Occupied: 1 | Unoccupied: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/ZoneAlpha \(Rows: 2, Cols: 2\)/i)).toBeInTheDocument();

    // Check for suggestion message
    expect(screen.getByText(/Suggestion: Consider moving emp101 to ZoneAlpha-R2C2./i)).toBeInTheDocument();
    expect(screen.getByText(/\(Est. Savings: 1.2 kWh\)/i)).toBeInTheDocument();

    // Check for seats (presence and basic classes)
    const seats = screen.getAllByTitle(/Seat:/); // Seats have a title attribute
    expect(seats.length).toBe(4);
    expect(screen.getByTitle(/Seat: ZoneAlpha-R1C1\nStatus: occupied\nOccupant: emp101/i)).toHaveClass('seat occupied');
    expect(screen.getByTitle(/Seat: ZoneAlpha-R1C2\nStatus: unoccupied\nEmpty/i)).toHaveClass('seat unoccupied');
    // For the suggested seat, the class is added dynamically based on suggestions.
    // The current logic in SeatingChart.jsx for 'suggested' class is based on `seat.status === 'suggested'`
    // or if `getSeatSuggestion` returns 'new-location'.
    // The mock data for arrangement already has a seat with status 'suggested'.
    // And the mock suggestion points to 'ZoneAlpha-R2C2'.
    // Let's ensure our mock suggestion logic correctly marks 'ZoneAlpha-R2C2' as suggested.

    // The component's getSeatSuggestion logic needs to be robust for this.
    // Based on the provided mock data for suggestions, the seat 'ZoneAlpha-R2C2' should get 'suggested' class.
    // The initial mockSeatingArrangementData already has R2C2 as 'suggested'.
    // Let's refine the test to check the specific seat from suggestion.
    const suggestedSeatElement = screen.getByTitle(/Seat: ZoneAlpha-R2C2\nStatus: suggested\nEmpty/i);
    expect(suggestedSeatElement).toHaveClass('seat suggested');


    // Verify API calls
    expect(api.getSeatingArrangement).toHaveBeenCalledTimes(1);
    expect(api.getSeatingSuggestions).toHaveBeenCalledTimes(1);
  });

  test('renders error message if API calls fail', async () => {
    api.getSeatingArrangement.mockRejectedValueOnce(new Error('Failed to fetch arrangement'));
    // getSeatingSuggestions will also be called, let it resolve or mock its failure too
    api.getSeatingSuggestions.mockResolvedValueOnce({ data: { message: '', suggested_moves: [] } });


    render(<SeatingChart />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading Seating Chart.../i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Error: Failed to fetch arrangement/i)).toBeInTheDocument();
  });

  test('renders "No seating arrangement data available" if API returns no zones', async () => {
    api.getSeatingArrangement.mockResolvedValueOnce({ data: { zones: [], total_seats: 0, occupied_seats: 0, unoccupied_seats: 0 } });
    api.getSeatingSuggestions.mockResolvedValueOnce({ data: { message: '', suggested_moves: [] } });


    render(<SeatingChart />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading Seating Chart.../i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/No seating arrangement data available./i)).toBeInTheDocument();
  });
});
```
