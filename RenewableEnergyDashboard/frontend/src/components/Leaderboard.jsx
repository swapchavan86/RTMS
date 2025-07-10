import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
// import './Leaderboard.css'; // Optional: if specific styling is needed beyond App.css

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await getLeaderboard(10); // Get top 10
        setLeaderboardData(response.data);
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

  if (loading) {
    return <div className="dashboard-section">Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="dashboard-section error-message">Error: {error}</div>;
  }

  if (leaderboardData.length === 0) {
    return <div className="dashboard-section">No leaderboard data available.</div>;
  }

  return (
    <div className="dashboard-section leaderboard-section">
      <h2>🏆 Employee Leaderboard</h2>
      <ul className="leaderboard-list">
        {leaderboardData.map((entry) => (
          <li key={entry.employee_id}>
            <span className="rank">#{entry.rank}</span>
            <span className="employee-name">{entry.name}</span>
            <span className="awe-points">{entry.awe_points} AwePs</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
```
