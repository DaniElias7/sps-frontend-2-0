import { useEffect, useState } from 'react';

function useAuth() {
    const [user, setUser] = useState(null);
    // Tracks loading state for this hook's internal initialization (reading localStorage)
    const [isLoading, setIsLoading] = useState(true);
    // Tracks errors specifically from localStorage read/parse
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            const storedUserData = localStorage.getItem('userData');

            if (storedUserData) {
                const parsedUser = JSON.parse(storedUserData);

                // Performing a basic check on essential user properties
                if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.name && parsedUser.email) {
                    setUser(parsedUser);
                } else {
                    console.error("Invalid user data structure in localStorage.");
                    setError("Dados do usuário inválidos. Faça login novamente.");
                }
            } else {
                // No data found in localStorage - this hook treats it as not authenticated (not an error)
                // The component using this hook is responsible for redirecting based on isAuthenticated
                console.warn("No user data found in localStorage.");
            }
        } catch (err) {
            // Handling potential JSON parsing errors
            console.error("Failed to read or parse user data from localStorage:", err);
            setError("Erro ao carregar dados do usuário localmente.");
        } finally {
            // Ensure loading is false after the process finishes, regardless of outcome
            setIsLoading(false);
        }
    }, []);

    // Derived state for easier checking if a user is authenticated
    const isAuthenticated = !!user && !error;

    return {
        user,
        isLoading,
        error,
        isAuthenticated,
    };
}

export default useAuth;