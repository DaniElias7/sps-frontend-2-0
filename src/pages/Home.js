import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Handler for the "Entrar" button click
  const handleEnterClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('userData')).type;

      userData.type === 'admin' ? navigate('/users') : navigate('/profile/' + userData.id);
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="container mt-5 py-5 text-center bg-white rounded mx-auto">
      <h1 className="h1 mb-4 text-dark">SPS Group</h1>
      <p className="lead mb-4">Transformamos tecnologia em sucesso há mais de uma década.</p>
      <button
        onClick={handleEnterClick}
        className="btn btn-primary btn-lg m-2"
      >
        Entrar
      </button>
    </div>
  );
};

export default Home;