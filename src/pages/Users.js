import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUsersData from '../hooks/useUsersData';
import CreateUserModal from '../components/CreateUserModal';
import UserRow from '../components/UserRow';

import useFilteredAndSortedUsers from '../hooks/useFilteredAndSortedUsers';
import { useLogout } from '../hooks/useLogout';

const Users = () => {
    // Primary data and state managed by the data hook
    const {
        users, // Raw list fetched by the hook
        loading, // Initial fetch loading state
        error: hookError, // API-related errors from the hook
        userRole, // Logged-in user's role from the hook
        token, // Auth token from the hook
        isAuthError, // Authentication error signal from the hook
        refreshUsers, // Function to refetch users
        deleteUser, // Function to delete a user via API
    } = useUsersData();

    const navigate = useNavigate();

    // Local UI state for modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Local UI state for displaying authentication-related errors
    const [localError, setLocalError] = useState('');

    // Use custom hook for filtering and sorting logic
    const {
        filteredAndSortedUsers, // Processed list ready for rendering
        filterText, // Current filter input value
        handleFilterChange, // Handler for filter input changes
    } = useFilteredAndSortedUsers(users, userRole); // Pass raw data and role to the hook

    // Effect to handle authentication errors detected by the data hook
    const handleLogout = useLogout(); // Call the logout hook to clear session and redirect

    useEffect(() => {
      // Only execute logic AFTER initial loading is complete
      if (!loading) {
          // If logged in but NOT an admin, redirect to profile page
          if (userRole && userRole !== 'admin') {
              console.log(`Access Denied: User role is '${userRole}'. Redirecting to profile.`);
              try {
                  // Attempt to get user ID from localStorage for redirection
                  const storedUserData = JSON.parse(localStorage.getItem('userData'));
                  if (storedUserData && storedUserData.id) {
                      navigate(`/profile/${storedUserData.id}`, { replace: true }); // Use replace to prevent admin page in history
                  } else {
                      console.error("User ID not found in localStorage for redirection. Redirecting to signin.");
                      // Fallback: Redirect to login if user ID is missing
                      navigate('/signin', { replace: true });
                  }
              } catch (error) {
                  console.error("Failed to parse user data from localStorage:", error);
                  navigate('/signin', { replace: true }); // Redirect on localStorage read error
              }
          } else if (isAuthError) {
              // If authentication error occurs (invalid/expired token), redirect to login
              console.log("Authentication error detected. Redirecting to signin.");
              setLocalError('Sua sessão expirou. Por favor, faça login novamente.');
              navigate('/signin', { replace: true });
          } else if (userRole === 'admin') {
               // If user is admin and no auth error, clear local errors and allow access
               setLocalError(''); // Clear old error messages
          }
      }
      // Dependencies for this effect
    }, [loading, userRole, isAuthError, navigate, handleLogout, setLocalError]);

    // Modal handlers
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // Callback after a user is successfully created in the modal
    const handleUserCreated = () => {
        handleCloseModal();
        refreshUsers(); // Refresh the user list by calling the function from the data hook
    };


    // Render initial loading state if no users are loaded and no immediate errors
    if (loading && users.length === 0 && !isAuthError && !hookError) {
        return (
            <div className="text-center mt-5 py-3">
                <p className="text-muted h5">Carregando...</p>
            </div>
        );
    }
    
    // Explicitly block rendering for non-admins after loading completes.
    if (!loading && userRole && userRole !== 'admin') {
      return (
           <div className="text-center mt-5 py-3">
               <p className="text-muted h5">Acesso negado. Redirecionando...</p>
           </div>
      );
    }

    // Main UI render
    return (
        <div className="container mt-4 mb-4 p-4 bg-white rounded shadow-sm">
            {/* Header section with title and logout button */}
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3 pb-3">
                    <h2>SPS Group</h2>
                    <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm px-5">
                        Sair
                    </button>
                </div>
                 {/* Sub-header with list title, filter, and create button */}
                <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-3 pb-3 border-bottom">
                    <p className="mb-2 mb-md-0 text-body-secondary">Total usuários: {users.length}</p>
                     {/* Filter input  - managed by filtering hook */}
                    <div className="d-flex align-items-center">
                        <p className="mb-2 mb-md-0 mx-2">Filtrar:</p>
                        <input
                            className="form-control mb-2 mb-md-0"
                            type="text"
                            placeholder="Digite um nome ou email"
                            value={filterText}
                            onChange={handleFilterChange}
                        />
                    </div>
                    {/* Create User button (visible only for admin users) */}
                    <div className="d-flex gap-2">
                        <Link to="/profile/1" className="btn btn-light">Meu Perfil</Link>
                        <button onClick={handleOpenModal} className="btn btn-primary">
                            Criar Usuário
                        </button>
                    </div>
                </div>
            </div>

            {/* Display error messages (local UI errors like auth or API errors from hook) */}
            {(localError || hookError) && (
                <div className="alert alert-danger text-center my-3" role="alert">
                    {localError || hookError} {/* Prioritize local error message if set */}
                </div>
            )}

            {/* Users Table - Render only if no authentication error prevents display */}
            {!isAuthError ? (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th scope="col" className="text-start">ID</th>
                                <th scope="col" className="text-start">Name</th>
                                <th scope="col" className="text-start">Email</th>
                                <th scope="col" className="text-start d-none d-md-table-cell">Type</th>
                                <th scope="col" className="text-end d-none d-md-table-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Map the processed list from the filtering/sorting hook to UserRow components */}
                            {filteredAndSortedUsers.map(user => (
                                <UserRow
                                    key={user.id} // Key is essential for list rendering performance
                                    user={user} // Pass user data to the row component
                                    userRole={userRole} // Pass role for row-level display/logic
                                    onDelete={deleteUser} // Pass the delete handler from the data hook
                                />
                            ))}
                             {/* Display message if no users match the current filter */}
                            {filteredAndSortedUsers.length === 0 && !loading && ( // Show only if the filtered list is empty AND not currently loading initial data
                                 <tr>
                                      {/* Adjust colSpan based on whether admin columns are visible */}
                                      <td colSpan={userRole === 'admin' ? 5 : 3} className="text-center text-muted py-3">
                                          {filterText ? "Nenhum usuário encontrado para este filtro." : "Nenhum usuário para exibir."}
                                      </td>
                                 </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            ) : null} {/* Hide the table content if an authentication error is present */}

            {/* Conditional rendering of the Create User modal */}
            {isModalOpen && (
                <CreateUserModal
                    onClose={handleCloseModal} // Handler to close the modal
                    onUserCreated={handleUserCreated} // Callback after successful creation
                    token={token} // Pass token to the modal for its API calls
                />
            )}
        </div>
    );
};

export default Users;