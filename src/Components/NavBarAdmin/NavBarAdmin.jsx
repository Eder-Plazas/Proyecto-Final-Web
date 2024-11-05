import React from 'react';
import { Link } from 'react-router-dom';
import './NavBarAdmin.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li><Link to="/users">Usuarios</Link></li>
        <li><Link to="/settings">Configuraciones</Link></li>
        <li><Link to="/">Cerrar sesión</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
