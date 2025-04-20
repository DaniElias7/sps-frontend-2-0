import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';

const useUsersData = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // State to signal if an authentication error occurred (e.g., session expired)
  const [isAuthError, setIsAuthError] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    setIsAuthError(false);

    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      // No token found, indicate auth error to the component
      setIsAuthError(true);
      setLoading(false);
      return;
    }
    setToken(currentToken);

    try {
      const userData = await UserService.list(currentToken);
      setUsers(userData);

      const loggedInUser = JSON.parse(localStorage.getItem('userData'));
      // Null check added for safety
      setUserRole(loggedInUser ? loggedInUser.type : null);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      // Check for 401 status or specific unauthorized messages
      if (err.message.includes('401') || err.message.includes('Unauthorized') || (err.response && err.response.status === 401)) {
        // Indicate auth error instead of setting a temporary message
        setIsAuthError(true);
        // Clear local storage as session is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      } else {
        // Other errors
        setError(err.message || 'Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this callback is created once

  // Handles user deletion
  const deleteUser = useCallback(async (id) => {
    if (!window.confirm(`Are you sure you want to delete the user with ID ${id}?`)) {
      return;
    }

    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setIsAuthError(true);
      return;
    }

    try {
      await UserService.delete(id, currentToken);
      // Optimistically update local state
      setUsers(users.filter(user => user.id !== id));
       // Clear any previous general error message on successful deletion
       setError('');
    } catch (err) {
       console.error("Delete User Error:", err);
       if (err.response) {
           if (err.response.status === 403) {
               setError(`You do not have permission to delete user with ID ${id}.`);
           } else if (err.response.status === 401) {
              setIsAuthError(true);
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
           } else {
               setError(`Error ${err.response.status}: ${err.message || `Failed to delete user with ID ${id}`}`);
           }
       } else {
           setError(err.message || `Failed to delete user with ID ${id}`);
       }
        // Clear the specific delete error message after 3 seconds, unless it's an auth error
        if (!isAuthError) {
            setTimeout(() => {
                setError('');
            }, 3000);
        }
    }
  }, [users, isAuthError]); // users needed for filter, isAuthError to control timeout clear

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // fetchUsers is stable due to useCallback with empty deps

  // Return the state and functions needed by the consuming component
  return {
    users,
    loading,
    error, // API-related error (excluding auth errors now handled by isAuthError)
    userRole,
    token,
    isAuthError, // Signal to the component to handle auth failure (e.g. redirect)
    refreshUsers: fetchUsers, // Alias for clarity
    deleteUser,
  };
};

export default useUsersData;