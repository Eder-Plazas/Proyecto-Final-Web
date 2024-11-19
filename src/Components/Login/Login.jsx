import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../Firebase/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../Firebase/Firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login');
    return () => {
      document.body.classList.remove('login');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setError('Por favor, complete todos los campos.');
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        const user = userCredential.user;

        localStorage.setItem('userId', user.uid);

        const docRef = doc(db, "usuarios", user.uid); 
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          localStorage.setItem('username', data.NombreUsuario);

          if (data.TipoRol === 'administrador') {
            navigate('/homepageadmin');
          } else {
            navigate('/home');
          }
        } else {
          setError('No se encontró el usuario en la base de datos.');
        }
      } catch (error) {
        setError('Error al iniciar sesión. Verifique sus credenciales.');
        console.error('Error al iniciar sesión:', error);
      }
    }
  };

  return (
    <>
      <header className="eco-notas-header">
        <h1 className="eco-notas-title">EcoNotas</h1>
      </header>

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
    </>
  );
};

export default Login;
