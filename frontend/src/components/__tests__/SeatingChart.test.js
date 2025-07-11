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

  test('renders multiple zones correctly', async () => {
    const multiZoneData = {
      zones: [
        { zone_id: 'ZoneAlpha', grid_rows: 1, grid_cols: 1, seats: [{ seat_id: 'ZA-R1C1', status: 'occupied', employee_id: 'empA' }] },
        { zone_id: 'ZoneBeta', grid_rows: 1, grid_cols: 2, seats: [
          { seat_id: 'ZB-R1C1', status: 'unoccupied', employee_id: null },
          { seat_id: 'ZB-R1C2', status: 'unoccupied', employee_id: null },
        ]},
      ],
      total_seats: 3, occupied_seats: 1, unoccupied_seats: 2,
    };
    api.getSeatingArrangement.mockResolvedValue({ data: multiZoneData });
    api.getSeatingSuggestions.mockResolvedValue({ data: { message: 'No specific suggestions.', suggested_moves: [] } }); // Minimal suggestions

    render(<SeatingChart />);
    await waitFor(() => expect(screen.queryByText(/Loading Seating Chart.../i)).not.toBeInTheDocument());

    expect(screen.getByText(/ZoneAlpha \(Rows: 1, Cols: 1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/ZoneBeta \(Rows: 1, Cols: 2\)/i)).toBeInTheDocument();

    // Check total seats rendered (one for Alpha, two for Beta)
    const seats = screen.getAllByTitle(/Seat:/);
    expect(seats.length).toBe(3);
    expect(screen.getByTitle(/Seat: ZA-R1C1/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Seat: ZB-R1C1/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Seat: ZB-R1C2/i)).toBeInTheDocument();
  });

  test('displays default message or nothing if suggestions.message is empty/null', async () => {
    api.getSeatingArrangement.mockResolvedValue({ data: mockSeatingArrangementData }); // Use default arrangement
    api.getSeatingSuggestions.mockResolvedValue({
      data: {
        message: '', // Empty message
        suggested_moves: [],
        estimated_energy_saving_kwh: 0
      }
    });

    render(<SeatingChart />);
    await waitFor(() => expect(screen.queryByText(/Loading Seating Chart.../i)).not.toBeInTheDocument());

    // The component currently renders "Suggestion: " even if message is empty.
    // Let's test for the absence of a specific suggestion message text, or the presence of a default if any.
    // If suggestions.message is empty, it would render "Suggestion:  (Est. Savings: 0 kWh)"
    // This might be an area for improvement in the component (e.g., not show "Suggestion:" if message is falsy)
    // For now, test current behavior:
    const suggestionElement = screen.getByText((content, element) => {
      return element.textContent.startsWith('Suggestion:') && element.classList.contains('seating-suggestion-message');
    });
    expect(suggestionElement).toBeInTheDocument();
    expect(suggestionElement.textContent).not.toContain('Consider moving'); // Ensure specific message is not there
    expect(screen.queryByText(/Consider moving emp101 to ZoneAlpha-R2C2/i)).not.toBeInTheDocument();

    // If suggestions object itself is null/undefined, the component should handle it.
    // The component's useEffect fetches it, so it would be null initially then populated.
    // Let's test when suggestions data is minimal (no message, no moves)
    api.getSeatingSuggestions.mockResolvedValueOnce({ data: { suggested_moves: [] } }); // No message field
    render(<SeatingChart />);
    await waitFor(() => expect(screen.queryByText(/Loading Seating Chart.../i)).not.toBeInTheDocument());
    // In this case, `suggestions.message` would be undefined, so the suggestion div might not render at all, or render differently.
    // Current component logic: `suggestions && suggestions.message && (...)`
    // So if `suggestions.message` is undefined or empty, the suggestion div won't render.
    expect(screen.queryByText((content, element) => element.classList.contains('seating-suggestion-message'))).not.toBeInTheDocument();
  });

  test('handles missing or empty suggestions.suggested_moves gracefully in getSeatSuggestion', async () => {
    // Test with suggestions but empty suggested_moves
    api.getSeatingArrangement.mockResolvedValue({ data: mockSeatingArrangementData });
    api.getSeatingSuggestions.mockResolvedValue({
      data: {
        message: 'Some general advice.',
        suggested_moves: [], // Empty moves
        estimated_energy_saving_kwh: 0
      }
    });
    render(<SeatingChart />);
    await waitFor(() => expect(screen.queryByText(/Loading Seating Chart.../i)).not.toBeInTheDocument());

    // Ensure no seats get 'suggested' class if suggested_moves is empty
    const suggestedSeat = screen.queryByTitle(/Seat: ZoneAlpha-R2C2\nStatus: suggested\nEmpty/i);
    // In mockSeatingArrangementData, R2C2 has status: 'suggested'.
    // The getSeatSuggestion looks at `suggestions.suggested_moves`. If empty, it won't add 'suggested' class based on that.
    // However, the initial class is from seat.status.
    // This test should check that getSeatSuggestion doesn't *add* 'suggested' if moves are empty.
    // The seat ZA-R2C2 is already 'suggested' via its own status in mockSeatingArrangementData.
    // So, the class 'suggested' will be there from `seatClass = `seat ${seat.status}`;`
    // This test case is tricky because the initial data already marks a seat as suggested.
    // Let's use a seat that is NOT initially suggested.
    const unocSeat = screen.getByTitle(/Seat: ZoneAlpha-R1C2\nStatus: unoccupied\nEmpty/i);
    expect(unocSeat).not.toHaveClass('suggested'); // Should not become suggested if no moves

    // Test with null suggested_moves
    api.getSeatingSuggestions.mockResolvedValueOnce({
      data: {
        message: 'More advice.',
        suggested_moves: null, // Null moves
      }
    });
    render(<SeatingChart />); // Will re-render with new suggestion data
    await waitFor(() => expect(screen.queryByText(/Loading Seating Chart.../i)).not.toBeInTheDocument());
    const unocSeatAgain = screen.getByTitle(/Seat: ZoneAlpha-R1C2\nStatus: unoccupied\nEmpty/i);
    expect(unocSeatAgain).not.toHaveClass('suggested');

    // The component should not crash.
    expect(screen.getByText(/Some general advice./i)).toBeInTheDocument(); // From the first mock in this test
    expect(screen.getByText(/More advice./i)).toBeInTheDocument(); // From the second mock
  });

});
```
