import React, { useState, useEffect } from 'react';
import { auth, db } from '../../Components/Firebase/Firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './HomePage.css';

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [showCreateLogForm, setShowCreateLogForm] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [bitacoras, setBitacoras] = useState([]);

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

  useEffect(() => {
    const fetchBitacoras = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const bitacorasQuery = query(
          collection(db, 'bitacoras'),
          where('userId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(bitacorasQuery);
        const fetchedBitacoras = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBitacoras(fetchedBitacoras);
      }
    };

    if (activeTab === 'viewLogs') {
      fetchBitacoras();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedOut(true);
    window.location.href = '/';
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

      setShowSuccessMessage(true);
      setShowCreateLogForm(false);
      e.target.reset();

      console.log('Bitácora creada con éxito:', bitacoraData);
    } catch (error) {
      console.error('Error al crear la bitácora:', error);
      alert('Hubo un error al crear la bitácora.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'bitacoras', id));
      setBitacoras(bitacoras.filter((bitacora) => bitacora.id !== id));
      alert('Bitácora eliminada con éxito.');
    } catch (error) {
      console.error('Error al eliminar la bitácora:', error);
    }
  };

  const renderTabContent = () => {
    if (isLoggedOut) {
      return <div className="message">Sesión cerrada. Vuelva a iniciar sesión para continuar.</div>;
    }
    if (activeTab === 'viewLogs') {
      return (
        <div className="content-section">
          {bitacoras.length > 0 ? (
            bitacoras.map((bitacora) => (
              <div key={bitacora.id} className="bitacora-item">
                <h3>{bitacora.title}</h3>
                <p><strong>Fecha:</strong> {bitacora.datetime}</p>
                <p><strong>Ubicación:</strong> {bitacora.location}</p>
                <p><strong>Clima:</strong> {bitacora.weather}</p>
                <p><strong>Hábitat:</strong> {bitacora.habitat}</p>
                <div>
                  <strong>Fotos del Sitio:</strong>
                  {bitacora.sitePhotos.length > 0 ? (
                    <div className="photos-container">
                      {bitacora.sitePhotos.map((url, index) => (
                        <img key={index} src={url} alt={`Sitio ${index}`} className="photo" />
                      ))}
                    </div>
                  ) : (
                    <p>No hay fotos del sitio.</p>
                  )}
                </div>

                <p><strong>Observaciones:</strong> {bitacora.observations}</p>
                
                <div className="bitacora-actions">
                  <button className="btn-edit">Editar</button>
                  <button onClick={() => handleDelete(bitacora.id)} className="btn-delete">Eliminar</button>
                </div>
              </div>
            ))
          ) : (
            <p>No tienes bitácoras registradas.</p>
          )}
        </div>
      );
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
          <button onClick={() => setShowCreateLogForm(!showCreateLogForm)} className="action-button">
            {showCreateLogForm ? 'Cancelar' : 'Crear Bitácora'}
          </button>
          <button onClick={() => setActiveTab('viewLogs')} className={`tab-button ${activeTab === 'viewLogs' ? 'active' : ''}`}>
            Ver Bitácoras
          </button>
          <button onClick={() => setActiveTab('searchLogs')} className={`tab-button ${activeTab === 'searchLogs' ? 'active' : ''}`}>
            Buscar Bitácoras
          </button>
          <button onClick={handleLogout} className="action-button logout-button">Cerrar Sesión</button>
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
                  <textarea name="habitat" placeholder="Ej: Bosque tropical, pradera..." required />
                  
                  <label>Nombre Científico:</label>
                  <input type="text" name="scientificName" required />
                  
                  <label>Nombre Común:</label>
                  <input type="text" name="commonName" required />
                  
                  <label>Familia:</label>
                  <input type="text" name="family" required />
                  
                  <label>Cantidad de Muestras:</label>
                  <input type="number" name="sampleQuantity" required />
                  
                  <label>Estado de la Planta:</label>
                  <input type="text" name="plantStatus" placeholder="Ej: Saludable, Dañada, Marchita..." required />
                  
                  <label>Observaciones:</label>
                  <textarea name="observations" placeholder="Detalles adicionales..." required />
                  
                  <label>Fotos del Sitio:</label>
                  <input type="file" name="sitePhotos" accept="image/*" multiple />
                  
                  <label>Fotos de la Especie:</label>
                  <input type="file" name="speciesPhotos" accept="image/*" multiple />

                  <button type="submit">Guardar Bitácora</button>
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
