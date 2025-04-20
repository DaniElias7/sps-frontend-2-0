import React from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import useUserEditForm from '../hooks/useUserEditForm';

const UserEdit = () => {
  // Get the initial user data resolved by the loader.
  // Loader handles initial loading state and auth redirect.
  const initialUser = useLoaderData();
  const navigate = useNavigate();

  // Use the custom hook to manage form state, handlers, and submission logic.
  const {
    formData,
    newPassword,
    handleChange,
    handlePasswordChange,
    handleSubmit,
    submitLoading, // Loading state specific to the form submission
    submitError, // Error message specific to validation or submission API call
  } = useUserEditForm(initialUser); // Pass initial data to the form hook

  // Handle case where the loader returned null (user not found or initial fetch failed).
  if (!initialUser) {
      return (
          <div className="alert alert-warning text-center mt-5" role="alert">
              User not found or failed to load.
              <div className="mt-2">
                 <button onClick={() => navigate('/users')} className="btn btn-secondary btn-sm">
                     Back to Users List
                 </button>
              </div>
          </div>
      );
  }

  // Main render: the edit form
  return (
    <div className="container py-4 mt-4 mb-4 bg-white rounded shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
      <h2 className="h2 text-center mb-4">Editar Usuário</h2>

      {/* Display submission/validation errors from the hook */}
      {submitError && (
        <div className="alert alert-danger my-3" role="alert">
            {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* Email Field */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        {/* New Password Field */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Nova Senha:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={newPassword}
            onChange={handlePasswordChange}
            className="form-control"
            placeholder="Deixe em branco para manter a senha atual"
            autoComplete="new-password"
          />
        </div>

        {/* Type Field */}
        <div className="mb-3">
          <label htmlFor="type" className="form-label">Tipo:</label>
          <select
            id="type"
            name="type"
            value={formData.type || 'regular'}
            onChange={handleChange}
            className="form-select"
          >
            <option value="regular">Regular</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitLoading} // Disable while submitting
          >
            {submitLoading ? 'Salvando...' : 'Salvar Alterações'} {/* Show loading text */}
          </button>
          {/* Cancel button navigation */}
          <button type="button" onClick={() => navigate('/users')} className="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;