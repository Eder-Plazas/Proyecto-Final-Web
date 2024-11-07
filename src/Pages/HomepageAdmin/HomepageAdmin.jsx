import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Components/Firebase/Firebase';
import "./HomepageAdmin.css";

const HomepageAdmin = () => {
  const [adminUsername, setAdminUsername] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('config');

  useEffect(() => {
    const fetchAdminData = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const docRef = doc(db, "usuarios", userId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setAdminUsername(data.NombreUsuario);
          } else {
            setError('No se encontró el usuario.');
          }
        } catch (error) {
          console.error("Error al obtener el usuario:", error);
          setError('Error al obtener el usuario.');
        }
      }
    };

    fetchAdminData();
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="container">
      <div className="menu">
        <button onClick={() => handleSectionChange("config")}>
          Configuración
        </button>
        <button onClick={() => handleSectionChange("viewUsers")}>
          Ver Usuarios
        </button>
        <button className="secondary" onClick={() => handleSectionChange("logout")}>
          Cerrar Sesión
        </button>
      </div>

      <div className="content">
        <h1>Página del administrador: {adminUsername}</h1>
        {error && <p className="error">{error}</p>}
        
        {activeSection === "config" && (
          <div>
            <h2>Configuración de la página</h2>
          </div>
        )}
        {activeSection === "viewUsers" && (
          <div>
            <h2>Lista de Usuarios</h2>
          </div>
        )}
        {activeSection === "logout" && (
          <div>
            <h2>Cerrando Sesión...</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomepageAdmin;








