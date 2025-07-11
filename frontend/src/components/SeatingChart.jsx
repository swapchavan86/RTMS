import React, { useState, useEffect } from 'react';
import { getSeatingArrangement, getSeatingSuggestions } from '../services/api';

const SeatingChart = () => {
  const [seatingArrangement, setSeatingArrangement] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeZoneId, setActiveZoneId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const arrangementResponse = await getSeatingArrangement();
        const arrangementData = arrangementResponse.data;
        setSeatingArrangement(arrangementData);

        const suggestionsResponse = await getSeatingSuggestions();
        setSuggestions(suggestionsResponse.data);

        if (arrangementData && arrangementData.zones && arrangementData.zones.length > 0) {
          setActiveZoneId(arrangementData.zones[0].zone_id); // Default to first zone
        }

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
    return <div className="dashboard-section seating-section loading-message-box">Loading Seating Chart...</div>;
  }

  if (error) {
    return <div className="dashboard-section seating-section error-message-box">Error: {error}</div>;
  }

  if (!seatingArrangement || !seatingArrangement.zones || seatingArrangement.zones.length === 0) {
    return <div className="dashboard-section seating-section">No seating arrangement data available.</div>;
  }

  const activeZone = seatingArrangement.zones.find(z => z.zone_id === activeZoneId);

  // Enhanced suggestion mapping for easier lookup
  const suggestedMovesMap = suggestions?.suggested_moves?.reduce((acc, [empId, toSeatId, savings]) => {
    acc[empId] = { toSeatId, savings };
    return acc;
  }, {}) || {};

  const targetSeatsForSuggestions = suggestions?.suggested_moves?.map(([, toSeatId]) => toSeatId) || [];


  return (
    <div className="dashboard-section seating-section">
      <h2>Office Seating Arrangement</h2>
      <p>
        Total Seats: {seatingArrangement.total_seats} | Occupied: {seatingArrangement.occupied_seats} | Unoccupied: {seatingArrangement.unoccupied_seats}
      </p>

      {/* Zone Tabs/Buttons */}
      <div className="zone-tabs">
        {seatingArrangement.zones.map(zone => (
          <button
            key={zone.zone_id}
            className={`zone-tab-button ${zone.zone_id === activeZoneId ? 'active' : ''}`}
            onClick={() => setActiveZoneId(zone.zone_id)}
          >
            {zone.zone_id}
          </button>
        ))}
      </div>

      {suggestions?.suggested_moves?.length > 0 && (
        <div className="seating-suggestion-summary">
          <strong>Suggested Moves:</strong>
          <ul>
            {suggestions.suggested_moves.map(([empId, toSeatId, savings]) => (
              <li key={`${empId}-${toSeatId}`}>
                Move employee <strong>{empId}</strong> to seat <strong>{toSeatId}</strong> (Est. Savings: {savings} kWh)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display Active Zone */}
      {activeZone ? (
        <div key={activeZone.zone_id} className="seating-zone-content">
          <h3>{activeZone.zone_id} (Rows: {activeZone.grid_rows}, Cols: {activeZone.grid_cols})</h3>
          <div
            className="seating-chart"
            style={{ gridTemplateColumns: `repeat(${activeZone.grid_cols}, 1fr)` }}
          >
            {activeZone.seats.map(seat => {
              let seatClass = `seat ${seat.status}`;
              let titleText = `Seat: ${seat.seat_id}\nStatus: ${seat.status}`;
              if (seat.employee_id) titleText += `\nOccupant: ${seat.employee_id}`;
              let suggestionIcon = null;

              // Check for suggestions related to this seat
              const isTargetForMove = targetSeatsForSuggestions.includes(seat.seat_id);
              const employeeIsMoving = seat.employee_id && suggestedMovesMap[seat.employee_id];

              if (isTargetForMove) {
                seatClass += ' suggested'; // Use existing .suggested for new locations
                titleText += `\n✨ Suggested new seat for an employee.`;
              }

              if (employeeIsMoving) {
                // This employee is moving FROM this seat
                seatClass += ' suggested-vacate';
                titleText += `\n➡️ Suggested to move ${seat.employee_id} from this seat to ${suggestedMovesMap[seat.employee_id].toSeatId}.`;
              }

              // Determine icon based on final classes
              if (seatClass.includes('suggested')) { // For new locations
                suggestionIcon = <span className="suggestion-indicator new-location-arrow">➡️</span>;
              } else if (seatClass.includes('suggested-vacate')) { // For old locations
                suggestionIcon = <span className="suggestion-indicator vacate-arrow">⬅️</span>;
              }


              return (
                <div
                  key={seat.seat_id}
                  className={seatClass}
                  title={titleText}
                >
                  {suggestionIcon}
                  {seat.status === 'occupied' ? '👤' : <span className="seat-id-short">{seat.seat_id.slice(-2)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p>Select a zone to view the seating arrangement.</p>
      )}
    </div>
  );
};

export default SeatingChart;