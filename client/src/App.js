import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Predictions from './components/Predictions';
import PrivateRoute from './components/PrivateRoute';
import Leaderboard from './components/Leaderboard';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <div className="app-container">
      <Router>
        <Navbar isAuthenticated={isAuthenticated} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/predictions"
              element={
                <PrivateRoute>
                  <Predictions />
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Leaderboard season={new Date().getFullYear()} />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
