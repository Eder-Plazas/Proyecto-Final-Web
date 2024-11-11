import React, { useEffect, useState } from 'react';
import { auth, db } from '../../Components/Firebase/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './HomePage.css';

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('viewLogs');
  const [showCreateLogForm, setShowCreateLogForm] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDoc = doc(db, 'usuarios', currentUser.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUsername(userData.NombreUsuario);
          setUserRole(userData.TipoRol);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedOut(true);
  };

  const renderTabContent = () => {
    if (isLoggedOut) {
      return <div className="message">Sesión cerrada. Vuelva a iniciar sesión para continuar.</div>;
    }
    if (activeTab === 'viewLogs') {
      return <div className="content-section">Aquí puedes ver las bitácoras.</div>;
    }
    if (activeTab === 'searchLogs') {
      return <div className="content-section">Aquí puedes buscar en las bitácoras.</div>;
    }
  };

  return (
    <div className="homepage-fullscreen">
      <header className="header">
        <h2>Bienvenido, {userRole} {username}!</h2>
      </header>
      
      <div className="main-container">
        <div className="tab-container">
          <button 
            className={`tab-button ${activeTab === 'viewLogs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('viewLogs')}
          >
            Ver Bitácoras
          </button>
          <button 
            className={`tab-button ${activeTab === 'searchLogs' ? 'active' : ''}`} 
            onClick={() => setActiveTab('searchLogs')}
          >
            Buscar Bitácoras
          </button>
          <button className="action-button" onClick={() => setShowCreateLogForm(!showCreateLogForm)}>
            {showCreateLogForm ? 'Cancelar' : 'Crear Bitácora'}
          </button>
          <button className="action-button logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
          {showCreateLogForm && !isLoggedOut && (
            <div className="create-log-form">
              <h3>Crear Nueva Bitácora</h3>
              <form>
                <label>Título:</label>
                <input type="text" name="title" required />
                <label>Descripción:</label>
                <textarea name="description" required />
                <button type="submit" className="submit-button">Guardar Bitácora</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;





