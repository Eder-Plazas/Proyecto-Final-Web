import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import "./Register.css";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username === '' || email === '' || password === '' || role === '') {
      setError('Por favor, complete todos los campos.');
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "usuarios", user.uid), {
          Contraseña: password,
          Correo: email,
          NombreUsuario: username,
          TipoRol: role
        });

        setSuccessMessage('¡Registro exitoso!');
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('');
        setError('');

        setTimeout(() => {
          setSuccessMessage('');
        }, 2500);
      } catch (error) {
        setError('Error al registrar. Inténtelo de nuevo.');
        console.error('Error al registrar:', error);
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Regístrate</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Nombre de usuario:</label>
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
          <label htmlFor="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="input-group">
          <label>Rol:</label>
          <div className="role-options">
            <label>
              <input
                type="radio"
                name="role"
                value="investigador"
                checked={role === 'investigador'}
                onChange={(e) => setRole(e.target.value)}
              />
              Investigador
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="colaborador"
                checked={role === 'colaborador'}
                onChange={(e) => setRole(e.target.value)}
              />
              Colaborador
            </label>
          </div>
        </div>
        <button type="submit">Crear cuenta</button>
        <p className="login-link">
          ¿Ya tienes una cuenta? <Link to="/">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;




