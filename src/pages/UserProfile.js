import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import useUsersData from '../hooks/useUsersData';
import { useLogout } from '../hooks/useLogout';
import useAuth from '../hooks/useAuth';

function UserProfile() {
    // Auth state and user data are now provided by this hook
    const {
        user,
        isLoading: isAuthLoading, 
        error: authError,       
        isAuthenticated,
    } = useAuth();

    const { id: urlId } = useParams();
    const navigate = useNavigate();

    // Fetch state and functions from the users data hook 
    const {
        error: hookError, // Error from the users data hook's API calls
        isAuthError,      // Specific signal for authentication issues from the users data hook
    } = useUsersData();

    const handleLogout = useLogout();

    // Effect: Handles the initial authentication status based on the useAuth hook
    // Redirect to signin if authentication fails after the hook finishes loading
    useEffect(() => {
        // Only proceed once the auth hook has completed its initial check
        if (!isAuthLoading) {
             if (!isAuthenticated || authError) {
                console.warn("User not authenticated or auth error. Redirecting to signin.");
                navigate('/signin', { replace: true });
            }
        }
    }, [isAuthLoading, isAuthenticated, authError, navigate]); // Dependencies ensuring this effect reacts to changes in auth state

    // Effect: Corrects the URL path based on the authenticated user's ID
    useEffect(() => {
        // Conditions to attempt URL correction:
        // 1. Auth state has finished loading
        // 2. User data is available and authenticated
        // 3. The URL ID doesn't match the authenticated user's ID
        // 4. Ensure we're not already in a redirect flow due to an auth error
        if (!isAuthLoading && user && user.id && urlId !== user.id && isAuthenticated && !authError && !isAuthError) {
            console.log(`URL ID mismatch: '${urlId}'. Correcting to logged-in user's ID: '${user.id}'`);
            navigate(`/profile/${user.id}`, { replace: true });
        }
    }, [isAuthLoading, user, urlId, navigate, isAuthenticated, authError, isAuthError]); // Dependencies for this effect

    // Effect: Handles authentication errors specifically flagged by the users data hook
    // This catches auth errors from API operations, distinct from the initial auth check
     useEffect(() => {
        if (isAuthError) {
            console.error("Authentication error detected by hook useUsersData. Redirecting.");
            navigate('/signin', { replace: true });
        }
    }, [isAuthError, navigate]); // Dependencies for this effect

    // Conditional Rendering Logic

    // Loading state while authenticating
    if (isAuthLoading) {
        return <div className="text-center mt-5">Carregando dados do usuário...</div>;
    }

    // Handle and display authentication or API-related errors
     if (authError || hookError || !isAuthenticated) {
         const displayError = authError || hookError || (!isAuthenticated ? "Sessão inválida ou expirada. Por favor, faça login novamente." : "Ocorreu um erro.");
          // If not authenticated due to an error handled by the effect,
         // the redirect should take over. This div might only briefly show.
         return (
             <div className="alert alert-danger text-center my-3" role="alert">
                  {displayError.toString()}
             </div>
         );
     }

    // Fallback state: theoretically unreachable if redirects work, but a safeguard
     if (!user) {
           return (
             <div className="alert alert-warning text-center my-3" role="alert">
                  Dados do usuário não disponíveis após carregamento. Por favor, tente fazer login novamente.
             </div>
           );
     }

    // Success state: user data is loaded and authenticated
    return (
        <div className="container mt-4">
          <div className="row mb-4">
            <div className="col">
              <h2 className="mb-3 border-bottom pb-2">Painel do Colaborador</h2>
              <div>
                {/* Safely accessing user properties after null check */}
                <p className="lead mb-1"><strong>Nome:</strong> {user.name}</p>
                <p className="text-muted mb-1"><strong>Email:</strong> {user.email}</p>
                <p className="text-muted"><strong>ID do Funcionário:</strong> {user.id}</p>
              </div>
            </div>

            <div className="col-auto d-flex justify-content-end align-items-start">
                {/* Checking user type from the authenticated user object */}
                { user.type === 'admin' && (<Link to="/users" className='btn btn-primary me-2'>Listar Usuários</Link>)}
              <button
                className="btn btn-outline-secondary  me-2"
                onClick={handleLogout}
                aria-label="Sair da sessão"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
    );
}

export default UserProfile;