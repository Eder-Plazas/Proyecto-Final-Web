import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import HomePage from './Pages/Homepage/HomePage';
import HomepageAdmin from './Pages/HomepageAdmin/HomepageAdmin';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/homepageadmin" element={<HomepageAdmin />} />
      </Routes>
    </Router>
  );
};

export default App;


