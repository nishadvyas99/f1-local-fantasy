// client/src/components/Footer.js
import React from 'react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111', color: '#777', padding: '1rem 0' }}>
      <div className="container text-center" style={{ fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} F1 Fantasy. All rights reserved.
      </div>
    </footer>
  );
}