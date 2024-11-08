import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../Components/Firebase/Firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import './HomepageAdmin.css';

const HomepageAdmin = () => {
  const [adminUsername, setAdminUsername] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('config');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchAdminData = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const docRef = doc(db, 'usuarios', userId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setAdminUsername(data.NombreUsuario);
          } else {
            setError('No se encontró el usuario.');
          }
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
          setError('Error al obtener el usuario.');
        }
      }
    };

    fetchAdminData();
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section === 'viewUsers') {
      fetchAllUsers();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const usersCollection = collection(db, 'usuarios');
      const userSnapshot = await getDocs(usersCollection);
      const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al obtener usuarios.');
    }
  };

  return (
    <div className="container">
      {/* Menú de botones */}
      <div className="menu">
        <Button variant="contained" onClick={() => handleSectionChange('config')}>
          Configuración
        </Button>
        <Button variant="contained" onClick={() => handleSectionChange('viewUsers')}>
          Ver Usuarios
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          className="secondary"
        >
          Cerrar Sesión
        </Button>
      </div>

      <div className="content">
        <h1>Página del administrador: {adminUsername}</h1>
        {error && <p className="error">{error}</p>}
        
        {activeSection === 'config' && (
          <div>
            <h2>Configuración de la página</h2>
            {/* Contenido de configuración */}
          </div>
        )}
        
        {activeSection === 'viewUsers' && (
          <div>
            <h2>Lista de Usuarios</h2>
            {users.length > 0 ? (
              <ul>
                {users.map(user => (
                  <li key={user.id}>
                    <strong>Nombre de usuario:</strong> {user.NombreUsuario} <br />
                    <strong>Email:</strong> {user.Correo} <br />
                    <strong>Rol:</strong> {user.TipoRol} 
                    <hr />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay usuarios para mostrar.</p>
            )}
          </div>
        )}

        {activeSection === 'logout' && (
          <div>
            <h2>Cerrando Sesión...</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomepageAdmin;










