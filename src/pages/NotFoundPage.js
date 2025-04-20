import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container mt-5 text-center">
      <h1 className="display-4">404 - Página Não Encontrada</h1>
      <p className="lead">Desculpe, a página que você está procurando não existe.</p>
      <Link to="/" className="btn btn-primary mt-3">
        Ir para a Página Inicial
      </Link>
    </div>
  );
};

export default NotFoundPage;