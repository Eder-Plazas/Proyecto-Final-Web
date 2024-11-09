import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../Components/Firebase/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import "./HomePage.css";

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDoc = doc(db, "usuarios", currentUser.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUsername(userData.NombreUsuario);
          setUserRole(userData.TipoRol);

          if (userData.TipoRol === 'administrador') {
            navigate('/homepageadmin');
          }
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="homepage-container">
      <h2>Bienvenido, {userRole} {username}!</h2>
    </div>
  );
};

export default HomePage;




