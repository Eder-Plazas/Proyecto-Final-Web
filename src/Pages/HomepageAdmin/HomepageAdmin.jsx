import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Components/Firebase/Firebase';
import "./HomepageAdmin.css";

const HomepageAdmin = () => {
  const [adminUsername, setAdminUsername] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <h1>Página del administrador: {adminUsername}</h1>
    </div>
  );
};

export default HomepageAdmin;



