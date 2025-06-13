import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
      <div className="container">
      <div className="card text-center">
        <h1>F1 Fantasy App</h1>
        {token ? (
          <>
            <Link to="/predictions"><button className="primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1.1rem', margin: '1rem 0' }}>Predictions</button></Link>
            <p>You’re logged in!</p>
            {/* Website Rules */}
            <div className="card" style={{ textAlign: 'left', padding: '1rem', margin: '1rem 0' }}>
              <h3>Website Rules:</h3>
              <ul>
                <li>Submit your predictions before the race session starts.</li>
                <li>Points are awarded: 2 for exact, 1 for off by one.</li>
              </ul>
            </div>
            <button className="secondary" onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
          </>
        ) : (
          <div className="flex-center">
            <Link to="/login"><button className="primary">Login</button></Link>
            <Link to="/register" className="ml-2"><button className="secondary">Register</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
