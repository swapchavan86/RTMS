import React, { useState, useEffect } from 'react';
import { getSeatingArrangement, getSeatingSuggestions } from '../services/api';

const SeatingChart = () => {
  const [seatingArrangement, setSeatingArrangement] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const arrangementResponse = await getSeatingArrangement();
        setSeatingArrangement(arrangementResponse.data);

        const suggestionsResponse = await getSeatingSuggestions();
        setSuggestions(suggestionsResponse.data);

        setError(null);
      } catch (err) {
        console.error("Error fetching seating data:", err);
        setError(err.message || 'Failed to fetch seating data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-section">Loading Seating Chart...</div>;
  }

  if (error) {
    return <div className="dashboard-section error-message">Error: {error}</div>;
  }

  if (!seatingArrangement || !seatingArrangement.zones || seatingArrangement.zones.length === 0) {
    return <div className="dashboard-section">No seating arrangement data available.</div>;
  }

  // Helper to get suggestion for a seat
  const getSeatSuggestion = (seatId) => {
  if (!suggestions || !suggestions.suggested_moves) return null;

  const isNewLocation = suggestions.suggested_moves.find(([_, toSeatId]) => toSeatId === seatId);
  if (isNewLocation) return 'new-location';

  const isCurrentSeatToBeVacated = suggestions.suggested_moves.find(([fromSeatId, _]) => fromSeatId === seatId);
  if (isCurrentSeatToBeVacated) return 'vacate-this-seat';

  return null;
};



  return (
    <div className="dashboard-section seating-section">
      <h2>🪑 Office Seating Arrangement</h2>
      <p>Total Seats: {seatingArrangement.total_seats} | Occupied: {seatingArrangement.occupied_seats} | Unoccupied: {seatingArrangement.unoccupied_seats}</p>

      {suggestions?.suggested_moves?.length > 0 && (
        <div className="seating-suggestion-message">
          <strong>Suggested Moves:</strong>
          <ul>
            {suggestions.suggested_moves.map(([empId, toSeatId, savings]) => (
              <li key={`${empId}-${toSeatId}`}>
                Move {empId} to {toSeatId} (Est. Savings: {savings} kWh)
              </li>
            ))}
          </ul>
        </div>
      )}

      {seatingArrangement.zones.map(zone => (
        <div key={zone.zone_id} className="seating-zone">
          <h3>{zone.zone_id} (Rows: {zone.grid_rows}, Cols: {zone.grid_cols})</h3>
          <div
            className="seating-chart"
            style={{ gridTemplateColumns: `repeat(${zone.grid_cols}, 1fr)` }}
          >
            {zone.seats.map(seat => {
              let seatClass = `seat ${seat.status}`;
              const suggestionType = getSeatSuggestion(seat.seat_id);
              if (suggestionType === 'new-location') {
                seatClass += ' suggested';
              }
              // Add more classes if needed, e.g., for seats to be vacated based on suggestions.
              // This requires matching suggested_moves[0] (employee_id) to an employee on a seat.

              return (
                <div
                  key={seat.seat_id}
                  className={seatClass}
                  title={`Seat: ${seat.seat_id}\nStatus: ${seat.status}\n${seat.employee_id ? `Occupant: ${seat.employee_id}` : 'Empty'}`}
                >
                  {/* Display short ID or icon */}
                  {/* {seat.seat_id.substring(seat.seat_id.length - 4)} */}
                  {seat.status === 'occupied' ? '👤' : ''}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeatingChart;
