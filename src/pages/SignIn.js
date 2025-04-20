import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handles form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await UserService.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));

      data.user.type == 'admin' ? navigate('/users') : navigate('/profile/' + data.user.id);
    } catch (err) {
       // Handle different error structures from API or fetch
       let errorMessage = 'An error occurred during login. Please try again.';
       if (err.response && err.response.data && err.response.data.message) {
           errorMessage = err.response.data.message;
       } else if (err.message) {
           errorMessage = err.message;
       } else if (typeof err === 'string') {
           errorMessage = err;
       }

       // Check if the error message indicates invalid credentials
       if (errorMessage.toLowerCase().includes('invalid credentials') || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('incorrect')) {
         setError('Invalid credentials. Please try again.');
       } else {
         setError(errorMessage);
       }
    }
  };

  return (
    // Main container for the login form
    <div className="container py-5 mt-5 mb-4 bg-white rounded shadow-sm mx-auto" style={{ maxWidth: '450px' }}>
      <h2 className="h2 text-center mb-4">Entrar</h2>

      {error && (
        <div className="alert alert-danger my-3 text-center" role="alert">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email form group */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
          />
        </div>

        {/* Password form group */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control"
          />
        </div>

        {/* Submit button */}
        <button type="submit" className="btn btn-primary w-100 mt-3">Entrar</button>
      </form>
    </div>
  );
};

export default SignIn;