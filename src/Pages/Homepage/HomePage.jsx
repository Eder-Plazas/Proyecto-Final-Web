import React, { useEffect, useState } from 'react';
import "./HomePage.css";

const HomePage = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div className="homepage-container">
      <h2>Bienvenido, {username}!</h2>
    </div>
  );
};

export default HomePage;


