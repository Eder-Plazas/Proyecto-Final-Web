import React, { useEffect, useState } from 'react';
import { auth, db } from '../../Components/Firebase/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './HomePage.css';

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('');
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
    window.location.href = "/";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Bitácora creada con éxito");
  };

  return (
    <div className="homepage-fullscreen">
      <header className="header">
        <h2>Bienvenido, {userRole} {username}!</h2>
      </header>
      
      <div className="main-container">
        <div className="tab-container">
          <button className="action-button" onClick={() => setShowCreateLogForm(!showCreateLogForm)}>
            {showCreateLogForm ? 'Cancelar' : 'Crear Bitácora'}
          </button>
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
          <button className="action-button logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
          {showCreateLogForm && !isLoggedOut && (
            <div className="modal-overlay" onClick={() => setShowCreateLogForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Crear Nueva Bitácora</h3>
                <form onSubmit={handleSubmit}>
                  <label>Título de la Bitácora:</label>
                  <input type="text" name="title" required />
                  
                  <label>Fecha y Hora del Muestreo:</label>
                  <input type="datetime-local" name="datetime" required />
                  
                  <label>Localización Geográfica (Coordenadas GPS):</label>
                  <input type="text" name="location" placeholder="Ej: 6.2442° N, 75.5812° W" required />
                  
                  <label>Condiciones Climáticas:</label>
                  <input type="text" name="weather" placeholder="Ej: Soleado, Lluvia, Nublado" required />
                  
                  <label>Descripción del Hábitat:</label>
                  <textarea name="habitat" placeholder="Ej: Tipo de vegetación, altitud, etc." required></textarea>
                  
                  <label>Fotografías del Sitio de Muestreo:</label>
                  <input type="file" name="photos" multiple accept="image/*" />
                  
                  <h4>Detalles de las Especies Recolectadas</h4>

                  <label>Nombre Científico (si lo conoce):</label>
                  <input type="text" name="scientificName" placeholder="Ej: Quercus robur" />

                  <label>Nombre Común:</label>
                  <input type="text" name="commonName" placeholder="Ej: Roble" />

                  <label>Familia:</label>
                  <input type="text" name="family" placeholder="Ej: Fagaceae" />

                  <label>Cantidad de Muestras:</label>
                  <input type="number" name="sampleQuantity" min="1" placeholder="Ej: 5" required />

                  <label>Estado de la Planta:</label>
                  <select name="plantCondition" required>
                    <option value="">Seleccione una opción</option>
                    <option value="viva">Viva</option>
                    <option value="seca">Seca</option>
                    <option value="otro">Otro</option>
                  </select>

                  <label>Fotografías de las Especies Recolectadas:</label>
                  <input type="file" name="speciesPhotos" multiple accept="image/*" />
                  
                  <label>Observaciones Adicionales:</label>
                  <textarea name="observations" placeholder="Comentarios adicionales"></textarea>
                  
                  <button type="submit" className="submit-button">Guardar Bitácora</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
