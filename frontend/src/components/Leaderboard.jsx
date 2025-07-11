import React, { useState, useEffect } from 'react';
const { getLeaderboard } = require('../services/api');

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

  // Loading state with shimmer effect
  if (loading) {
    return (
      <div className="dashboard-section leaderboard-section">
        <h2>🏆 Employee Leaderboard</h2>
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

  // Error state with enhanced styling
  if (error) {
    return (
      <div className="dashboard-section leaderboard-section">
        <h2>🏆 Employee Leaderboard</h2>
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
          border: '1px solid var(--error-color)',
          padding: 'var(--spacing-lg)',
          borderRadius: 'var(--border-radius-lg)',
          color: 'var(--text-color)',
          borderLeft: '4px solid var(--error-color)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)'
        }}>
          <span style={{ fontSize: '1.2em' }}>⚠️</span>
          <div>
            <strong style={{ color: 'var(--error-color)', fontWeight: '600' }}>Error:</strong>
            <div style={{ marginTop: 'var(--spacing-xs)', color: 'var(--text-color-light)' }}>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state with enhanced styling
  if (leaderboardData.length === 0) {
    return (
      <div className="dashboard-section leaderboard-section">
        <h2>🏆 Employee Leaderboard</h2>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
          border: '1px solid var(--border-color-light)',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--border-radius-lg)',
          textAlign: 'center',
          color: 'var(--text-color-light)',
          borderLeft: '4px solid var(--info-color)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}>📊</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>
            No leaderboard data available
          </div>
          <div style={{ fontSize: '0.9rem', marginTop: 'var(--spacing-sm)' }}>
            Check back later for updated rankings
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section leaderboard-section">
      <h2>Employee Leaderboard</h2>
      
      {/* Stats summary */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid #a7f3d0',
          flex: '1',
          minWidth: '120px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: 'var(--secondary-color)' 
          }}>
            {leaderboardData.length}
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-color-light)',
            fontWeight: '500'
          }}>
            Total Employees
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid #93c5fd',
          flex: '1',
          minWidth: '120px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: 'var(--primary-color)' 
          }}>
            {leaderboardData.length > 0 ? leaderboardData[0].awe_points : 0}
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-color-light)',
            fontWeight: '500'
          }}>
            Top Score
          </div>
        </div>
      </div>

      {/* Leaderboard list */}
      <ul className="leaderboard-list">
        {leaderboardData.map((entry, index) => (
          <li key={entry.employee_id || index} style={{
            animation: `fadeInUp var(--transition-normal) ease-out ${index * 0.1}s both`
          }}>
            <span className="rank">#{entry.rank}</span>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              flex: '1',
              marginLeft: 'var(--spacing-md)'
            }}>
              <span className="employee-name">{entry.name}</span>
              {entry.department && (
                <span style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-color-muted)',
                  fontWeight: '400'
                }}>
                  {entry.department}
                </span>
              )}
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end',
              gap: 'var(--spacing-xs)'
            }}>
              <span className="awe-points">{entry.awe_points} AwePs</span>
              {index === 0 && (
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent-color)',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Champion
                </span>
              )}
              {index === 1 && (
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Runner-up
                </span>
              )}
              {index === 2 && (
                <span style={{
                  fontSize: '0.75rem',
                  color: '#d97706',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Third Place
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Additional info */}
      <div style={{
        marginTop: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color-light)',
        fontSize: '0.9rem',
        color: 'var(--text-color-light)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
          <span>🔄</span>
          <span>Rankings updated in real-time</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;