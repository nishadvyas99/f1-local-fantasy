// client/src/components/Leaderboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Leaderboard({ season }) {
  const [entries, setEntries] = useState([]);
  const [error, setError]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/leaderboard/${season}`)
      .then(res => setEntries(res.data))
      .catch(err => {
        console.error(err);
        setError('Could not load leaderboard.');
      })
      .finally(() => setIsLoading(false));
  }, [season]);

  if (error)       return <p>{error}</p>;
  if (isLoading)   return <p>Loading leaderboard…</p>;
  if (!entries.length) return <p>No leaderboard entries for season {season}.</p>;

  return (
    <div className="container">
    <div className="card">
      <h2>Leaderboard — Season {season}</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Rank</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>User</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc' }}>Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr key={e.userId}>
              <td style={{ padding: '0.5rem 0' }}>{idx + 1}</td>
              <td style={{ padding: '0.5rem 0' }}>{e.username}</td>
              <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{e.totalScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}