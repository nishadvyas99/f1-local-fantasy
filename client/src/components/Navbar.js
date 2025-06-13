// client/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <nav style={{ backgroundColor: '#111', padding: '0.5rem 1rem' }}>
      <div className="container flex-space">
        {/* Site Logo / Brand */}
        <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
          <Link to="/" style={{ color: '#fff' }}>F1 Fantasy</Link>
        </div>

        {/* Navigation Links */}
        <div className="flex">
          <Link to="/" style={{ color: '#ccc', marginRight: '1rem' }}>Home</Link>
          {isAuthenticated && (
            <>
              <Link to="/predictions" style={{ color: '#ccc', marginRight: '1rem' }}>
                Predictions
              </Link>
              <Link to="/leaderboard" style={{ color: '#ccc', marginRight: '1rem' }}>
                Leaderboard
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="secondary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login" style={{ color: '#ccc', marginRight: '1rem' }}>Login</Link>
              <Link to="/register" style={{ color: '#ccc' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}