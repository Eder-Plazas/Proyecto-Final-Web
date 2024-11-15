import React, { useState, useEffect } from 'react';
import { auth, db } from '../../Components/Firebase/Firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
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

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'bitacoras_usuario');
    formData.append('api_key', '245919566724295');
    formData.append('cloud_name', 'dpimogg4v');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dpimogg4v/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const bitacoraData = {
      title: e.target.title.value,
      datetime: e.target.datetime.value,
      location: e.target.location.value,
      weather: e.target.weather.value,
      habitat: e.target.habitat.value,
      sitePhotos: [],
      speciesDetails: {
        scientificName: e.target.scientificName.value,
        commonName: e.target.commonName.value,
        family: e.target.family.value,
        sampleQuantity: e.target.sampleQuantity.value,
        plantStatus: e.target.plantStatus.value,
      },
      observations: e.target.observations.value,
      speciesPhotos: [], 
      userId: currentUser.uid,
    };

    const siteFiles = e.target.sitePhotos.files;
    const siteImageUploadPromises = Array.from(siteFiles).map(uploadImageToCloudinary);

    const speciesFiles = e.target.speciesPhotos.files;
    const speciesImageUploadPromises = Array.from(speciesFiles).map(uploadImageToCloudinary);

    try {
      const siteImageUrls = await Promise.all(siteImageUploadPromises);
      const speciesImageUrls = await Promise.all(speciesImageUploadPromises);

      bitacoraData.sitePhotos = siteImageUrls;
      bitacoraData.speciesPhotos = speciesImageUrls;

      const bitacorasCollection = collection(db, 'bitacoras');
      await addDoc(bitacorasCollection, bitacoraData);

      console.log('Bitácora creada con éxito:', bitacoraData);
      alert('Bitácora creada con éxito.');
    } catch (error) {
      console.error('Error al crear la bitácora:', error);
      alert('Hubo un error al crear la bitácora.');
    }
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
                  <input type="file" name="sitePhotos" multiple accept="image/*" required />
                  
                  <label>Nombre Científico:</label>
                  <input type="text" name="scientificName" placeholder="Ej: Solanum lycopersicum" />
                  
                  <label>Nombre Común:</label>
                  <input type="text" name="commonName" placeholder="Ej: Tomate" />
                  
                  <label>Familia:</label>
                  <input type="text" name="family" placeholder="Ej: Solanaceae" />
                  
                  <label>Cantidad de Muestras:</label>
                  <input type="number" name="sampleQuantity" placeholder="Ej: 5" />
                  
                  <label>Estado de la Planta:</label>
                  <select name="plantStatus">
                    <option value="viva">Viva</option>
                    <option value="seca">Seca</option>
                    <option value="en crecimiento">En Crecimiento</option>
                  </select>

                  <label>Fotografías de las Especies Recolectadas:</label>
                  <input type="file" name="speciesPhotos" multiple accept="image/*" required />
                  
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
