import React, { useState, useEffect } from 'react';
const { getLeaderboard } = require('../services/api');

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const TOP_N_DISPLAY = 3; // Number of top entries to always display prominently

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await getLeaderboard(10); // Fetch top 10
        setLeaderboardData(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError(err.message || 'Failed to fetch leaderboard. Is the backend running?');
        setLeaderboardData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-section leaderboard-section">
        <h2>Employee Leaderboard</h2>
        <div className="loading-shimmer" style={{
          height: '200px',
          borderRadius: 'var(--border-radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-color-light)',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          Loading Leaderboard...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-section leaderboard-section">
        <h2>Employee Leaderboard</h2>
        <div className="error-message-box">{error}</div>
      </div>
    );
  }

  // Empty state
  if (leaderboardData.length === 0) {
    return (
      <div className="dashboard-section leaderboard-section">
        <h2>Employee Leaderboard</h2>
        <div className="loading-message-box" style={{ background: 'var(--border-color-light)'}}>
          No leaderboard data available right now.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section leaderboard-section">
      <h2>Employee Leaderboard</h2>
      
      {/* Leaderboard list - Top Entries */}
      <ul className="leaderboard-list top-entries">
        {leaderboardData.slice(0, TOP_N_DISPLAY).map((entry, index) => (
          <li key={entry.employee_id || index} className={`rank-${index + 1}`} style={{
            animation: `fadeInUp var(--transition-normal) ease-out ${index * 0.1}s both`
          }}>
            <span className="rank">#{entry.rank}</span>
            <div style={{ display: 'flex', flexDirection: 'column', flex: '1', marginLeft: 'var(--spacing-md)' }}>
              <span className="employee-name">{entry.name}</span>
              {entry.department && <span className="employee-department">{entry.department}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-xs)' }}>
              <span className="awe-points">{entry.awe_points} AwePs</span>
              {index === 0 && <span className="rank-badge champion">Champion 🥇</span>}
              {index === 1 && <span className="rank-badge runner-up">Runner-Up 🥈</span>}
              {index === 2 && <span className="rank-badge third-place">Third Place 🥉</span>}
            </div>
          </li>
        ))}
      </ul>

      {/* Conditionally render the rest of the list if showAll is true */}
      {showAll && leaderboardData.length > TOP_N_DISPLAY && (
        <div className="leaderboard-list-more-wrapper">
          <ul className="leaderboard-list additional-entries">
            {leaderboardData.slice(TOP_N_DISPLAY).map((entry, index) => (
              <li key={entry.employee_id || index} style={{
                animation: `fadeInUp var(--transition-fast) ease-out ${index * 0.05}s both`
              }}>
                <span className="rank">#{entry.rank}</span>
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1', marginLeft: 'var(--spacing-md)' }}>
                  <span className="employee-name">{entry.name}</span>
                  {entry.department && <span className="employee-department">{entry.department}</span>}
                </div>
                <span className="awe-points">{entry.awe_points} AwePs</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* "View All" / "Show Less" Button */}
      {leaderboardData.length > TOP_N_DISPLAY && (
        <button onClick={() => setShowAll(!showAll)} className="leaderboard-toggle-button">
          {showAll ? 'Show Less' : `View All (${leaderboardData.length - TOP_N_DISPLAY} more)`}
        </button>
      )}
    </div>
  );
};

export default Leaderboard;