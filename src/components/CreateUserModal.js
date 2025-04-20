// Modal component for creating users 
import React, { useState } from 'react';
import UserService from '../services/UserService';

const CreateUserModal = ({ onClose, onUserCreated, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'regular', // default value
  });
  const [errors, setErrors] = useState({}); // State for local validation errors
  const [apiError, setApiError] = useState(''); // State for API errors
  const [isLoading, setIsLoading] = useState(false); // State for handling loading status

  // Basic form validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'O nome é obrigatório.';
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'O formato do email é inválido.';
    }
    if (!formData.password) newErrors.password = 'A senha é obrigatória.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // Handles changes for form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    // Clear local validation error for the field on change
    if (errors[name]) {
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: null
        }));
    }
    setApiError(''); // Clear API error on data change
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
       return; // Stop submission if local validation fails
    }

    setIsLoading(true);
    try {
        await UserService.create(formData, token);
        setIsLoading(false);
        alert('Usuário criado com sucesso!'); // Simple success feedback
        onUserCreated(); // Refresh list and close modal (handled by parent)
    } catch (error) {
        setIsLoading(false);
        console.error("Error creating user:", error);
        setApiError(error.response?.data?.message || error.message || 'O email já está cadastrado.');
    }
  };

  // Render using Bootstrap modal and form classes
  return (
    // Modal Overlay
    <div className="modal fade show d-flex justify-content-center align-items-center" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        {/* Modal Dialog */}
        <div className="modal-dialog modal-dialog-centered">
            {/* Modal Content */}
            <div className="modal-content p-4 rounded shadow">
                {/* Modal Header */}
                <div className="modal-header border-bottom pb-3 mb-3">
                    <h5 className="modal-title">Criar Novo Usuário</h5>
                    <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {/* API Error Alert */}
                    {apiError && (
                        <div className="alert alert-danger text-center" role="alert">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Form Group: Name */}
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nome:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                // Apply is-invalid class based on validation state
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                required
                            />
                            {/* Validation feedback */}
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>

                        {/* Form Group: Email */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                required
                            />
                            {/* Validation feedback */}
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        {/* Form Group: Password */}
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Senha:</label>
                            <input
                                type="password" // Use type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                required
                            />
                            {/* Validation feedback */}
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>

                        {/* Form Group: Type */}
                        <div className="mb-3">
                            <label htmlFor="type" className="form-label">Tipo:</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="regular">Regular</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn btn-primary w-100 mt-3" disabled={isLoading}>
                            {isLoading ? 'Criando...' : 'Criar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CreateUserModal;