import React, { useEffect, useState } from 'react';
import { auth, db } from '../../Components/Firebase/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import "./HomePage.css";

const HomePage = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUsername(userData.NombreUsuario || 'Usuario');
          } else {
            console.log("No se encontró el documento del usuario.");
          }
        } catch (error) {
          console.error("Error al obtener el nombre de usuario:", error);
        }
      }
    };

    fetchUsername();
  }, []);

  return (
    <div className="homepage-container">
      <h2>Bienvenido, {username}!</h2>
    </div>
  );
};

export default HomePage;



