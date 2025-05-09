import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
      <h1>F1 Fantasy App</h1>
      {token ? (
        <>
          <p>You’re logged in!</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login"><button>Login</button></Link>{' '}
          <Link to="/register"><button>Register</button></Link>
        </>
      )}
    </div>
  );
}
