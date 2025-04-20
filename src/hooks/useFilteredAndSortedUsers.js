import { useState, useMemo, useCallback } from 'react';

// Custom hook for filtering and sorting a list of users based on specific rules.
const useFilteredAndSortedUsers = (users, userRole) => {
  // State for the text entered in the filter input field.
  const [filterText, setFilterText] = useState('');

  // Handler for updating the filter text state. Memoized for stability.
  const handleFilterChange = useCallback((event) => {
    setFilterText(event.target.value);
  }, []);

  // Memoized computation of the filtered and sorted user list.
  // Recalculates only when the raw users list, filter text, or user role changes.
  const filteredAndSortedUsers = useMemo(() => {
    // Safely retrieve the logged-in user ID for sorting priority rules.
    let loggedInUserId = null;
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Parse ID to integer for reliable comparison.
        loggedInUserId = userData?.id ? parseInt(userData.id, 10) : null;
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage for sorting:", error);
    }

    // Define the comparison logic for sorting users with multiple priorities.
    const compareUsers = (a, b) => {
      const idA = parseInt(a.id, 10);
      const idB = parseInt(b.id, 10);
      const isAdminA = a.type === 'admin';
      const isAdminB = b.type === 'admin';

      // Priority 1: User with ID 1 always comes first.
      if (idA === 1) return -1;
      if (idB === 1) return 1;

      // Priority 2: Admin users come before regular users (excluding ID 1).
      if (isAdminA && !isAdminB) return -1;
      if (!isAdminA && isAdminB) return 1;

      // Priority 3: The currently logged-in user comes before other users
      // within the same category (neither ID 1 nor different admin status).
      if (loggedInUserId && idA === loggedInUserId && idB !== loggedInUserId) return -1;
      if (loggedInUserId && idA !== loggedInUserId && idB === loggedInUserId) return 1;

      // Priority 4: Default sort by ID for users within the same priority group.
      return idA - idB;
    };

    // Apply filtering based on the current filter text (case-insensitive match on name or email).
    let processedUsers = [...users]; // Create a mutable copy.

    if (filterText.trim()) {
      const lowerCaseFilter = filterText.toLowerCase();
      processedUsers = processedUsers.filter(user =>
        (user.name && user.name.toLowerCase().includes(lowerCaseFilter)) ||
        (user.email && user.email.toLowerCase().includes(lowerCaseFilter))
      );
    }

    // Sort the list according to the defined comparison rules.
    processedUsers.sort(compareUsers); // sort() mutates in place, safe on the copy.

    return processedUsers;

  }, [users, filterText, userRole]); // Dependencies: Recalculate when these inputs change.

  // Return the processed list and state/handler for the filter input.
  return {
    filteredAndSortedUsers,
    filterText,
    handleFilterChange,
  };
};

export default useFilteredAndSortedUsers;