import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ParentDashboard from './pages/ParentDashboard';
import ChildDashboard from './pages/ChildDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} />} />
        <Route path="/parent-dashboard" element={<ParentDashboard user={user} />} />
        <Route path="/child-dashboard" element={<ChildDashboard user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
