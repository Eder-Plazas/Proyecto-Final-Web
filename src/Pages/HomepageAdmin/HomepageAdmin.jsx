import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../Components/Firebase/Firebase';
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import './HomepageAdmin.css';

const HomepageAdmin = () => {
  const [adminUsername, setAdminUsername] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('config');
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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

  const openModal = (user = {}) => {
    setIsEditing(!!user.id);
    setCurrentUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser({});
  };

  const handleSaveUser = async () => {
    try {
      if (!currentUser.Contraseña && !isEditing) {
        throw new Error('La contraseña es obligatoria para crear un usuario.');
      }

      if (isEditing) {
        await updateDoc(doc(db, "usuarios", currentUser.id), currentUser);

        if (currentUser.Contraseña) {
          const userCredential = await signInWithEmailAndPassword(auth, currentUser.Correo, currentUser.Contraseña);
          await updatePassword(userCredential.user, currentUser.Contraseña);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, currentUser.Correo, currentUser.Contraseña);

        await addDoc(collection(db, "usuarios"), {
          ...currentUser,
          userId: userCredential.user.uid,
        });
      }

      fetchAllUsers();

      closeModal();
    } catch (error) {
      console.error('Error al guardar usuario:', error.message);
      setError(error.message || 'Error al guardar usuario.');
    }
  };

  const confirmDeleteUser = (userId) => {
    setShowDeleteConfirmation(true);
    setUserToDelete(userId);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteDoc(doc(db, 'usuarios', userToDelete));
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
      fetchAllUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar usuario.');
    }
  };

  return (
    <div className="container">
      <div className="menu">
        <Button 
          variant={activeSection === 'config' ? "contained" : "outlined"} 
          onClick={() => handleSectionChange('config')}
          className={activeSection === 'config' ? "active" : ""}
        >
          Configuración
        </Button>
        <Button 
          variant={activeSection === 'viewUsers' ? "contained" : "outlined"} 
          onClick={() => handleSectionChange('viewUsers')}
          className={activeSection === 'viewUsers' ? "active" : ""}
        >
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
          </div>
        )}

        {activeSection === 'viewUsers' && (
          <div>
            <h2>Lista de Usuarios</h2>
            <Button variant="contained" onClick={() => openModal()}>Crear Usuario</Button>
            {users.length > 0 ? (
              <ul>
                {users.map(user => (
                  <li key={user.id}>
                    <strong>Nombre de usuario:</strong> {user.NombreUsuario} <br />
                    <strong>Email:</strong> {user.Correo} <br />
                    <strong>Rol:</strong> {user.TipoRol} 
                    <br />
                    <Button variant="contained" onClick={() => openModal(user)}>Editar</Button>
                    <Button variant="contained" color="secondary" onClick={() => confirmDeleteUser(user.id)}>Eliminar</Button>
                    <hr />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay usuarios para mostrar.</p>
            )}
          </div>
        )}

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h2>
              <input 
                type="text" 
                placeholder="Nombre de Usuario" 
                value={currentUser.NombreUsuario || ''} 
                onChange={(e) => setCurrentUser({ ...currentUser, NombreUsuario: e.target.value })} 
              />
              <input 
                type="text" 
                placeholder="Correo" 
                value={currentUser.Correo || ''} 
                onChange={(e) => setCurrentUser({ ...currentUser, Correo: e.target.value })} 
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={currentUser.Contraseña || ''} 
                onChange={(e) => setCurrentUser({ ...currentUser, Contraseña: e.target.value })} 
              />
              <select
                value={currentUser.TipoRol || 'investigador'}
                onChange={(e) => setCurrentUser({ ...currentUser, TipoRol: e.target.value })}
              >
                <option value="investigador">Investigador</option>
                <option value="colaborador">Colaborador</option>
                <option value="administrador">Administrador</option>
              </select>
              <Button variant="contained" onClick={handleSaveUser}>{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
              <Button variant="outlined" onClick={closeModal}>Cancelar</Button>
            </div>
          </div>
        )}

        {showDeleteConfirmation && (
          <div className="modal">
            <div className="modal-content">
              <h2>¿Estás seguro de que quieres eliminar este usuario?</h2>
              <Button variant="contained" color="secondary" onClick={handleDeleteUser}>Eliminar</Button>
              <Button variant="outlined" onClick={() => setShowDeleteConfirmation(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomepageAdmin;





