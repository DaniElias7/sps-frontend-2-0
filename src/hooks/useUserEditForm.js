import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';

// Custom hook for managing user edit form state and submission logic.
const useUserEditForm = (initialUser) => {
  // State for the form input values, initialized from the fetched user data.
  const [formData, setFormData] = useState(initialUser || { name: '', email: '', type: 'regular' });
  // Separate state for the password field, as it's handled differently (optional update).
  const [newPassword, setNewPassword] = useState('');

  // State to track the submission process status.
  const [submitLoading, setSubmitLoading] = useState(false);
  // State to hold validation or submission API errors.
  const [submitError, setSubmitError] = useState('');

  const { userId } = useParams();
  const navigate = useNavigate();

  // Effect to initialize form data when the initialUser prop is available or changes.
  // Ensures form is populated when data loads.
  useEffect(() => {
      if (initialUser) {
           setFormData({
               name: initialUser.name || '',
               email: initialUser.email || '',
               type: initialUser.type || 'regular',
           });
      }
  }, [initialUser]); // Rerun if the initial user data changes

  // Handles changes for standard form fields (name, email, type).
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
    setSubmitError(''); // Clear submission error on any form change.
  }, []);

  // Handles changes specifically for the new password field.
  const handlePasswordChange = useCallback((event) => {
    setNewPassword(event.target.value);
    setSubmitError(''); // Clear submission error on password change.
  }, []);


  // Handles the form submission to update the user.
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    // Basic client-side validation before attempting API call.
    if (!formData.name || !formData.email) {
        setSubmitError('Name and Email are required.');
        setSubmitLoading(false);
        return;
    }
    if (formData.email && !/\S+@\S+\.\S/.test(formData.email)) { // Added missing '.' in regex
        setSubmitError('Invalid email format.');
        setSubmitLoading(false);
        return;
    }

    try {
      const token = localStorage.getItem('token');
       // Basic token check fallback, though loader should handle primary auth check.
      if (!token) {
          navigate('/signin');
          setSubmitLoading(false);
          return;
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
        type: formData.type,
      };

      // Only include password in payload if the field is not empty.
      if (newPassword) {
        updateData.password = newPassword;
      }

      await UserService.update(userId, updateData, token);
      alert('User updated successfully!'); // Consider using a more sophisticated notification system
      navigate('/users'); // Redirect to user list on successful update.

    } catch (err) {
      console.error("Update user error:", err);
      // Set submission error based on API response or generic message.
      setSubmitError(err.response?.data?.message || err.message || 'Failed to update user.');
    } finally {
      setSubmitLoading(false);
    }
  }, [formData, newPassword, userId, navigate]); // Dependencies for useCallback

  // Return state and handlers for the consuming component to use.
  return {
    formData,
    newPassword,
    handleChange,
    handlePasswordChange,
    handleSubmit,
    submitLoading,
    submitError,
  };
};

export default useUserEditForm;