import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../Firebase/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setError('Por favor, complete todos los campos.');
    } else {
      try {

        await signInWithEmailAndPassword(auth, username, password);
        console.log('Inicio de sesión exitoso:', { username, password });
        setError('');
      } catch (error) {
        setError('Error al iniciar sesión. Verifique sus credenciales.');
        console.error('Error al iniciar sesión:', error);
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Correo electrónico:</label> 
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar sesión</button>
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;




