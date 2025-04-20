import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Renders a single row in the user table
// Receives user object, logged-in user's role, and delete handler as props
const UserRow = ({ user, userRole, onDelete }) => {
  const navigate = useNavigate();

  const isAdmin = userRole === 'admin';

  return (
    // key prop is handled in the parent component's map function - Good practice
    <tr key={user.id}>
      <td className="text-start">{user.id}</td>
      <td className="text-start">{user.name}</td>
      {/* I'm keeping the email column visible based on isAdmin flag */}
      {isAdmin && <td className="text-start">{user.email}</td>}
      {isAdmin && (
          // Hide this column on small screens, show it from the medium breakpoint up
          <td className="text-start d-none d-md-table-cell">
              {user.type}
          </td>
      )}
      {/* Hiding the action buttons column on small screens to keep the row compact */}
      <td className="text-end text-nowrap d-none d-md-table-cell">
        {isAdmin && user.name !== 'admin' && (
            <Link to={`/users/${user.id}`} className="btn btn-light btn-sm mx-2">Editar</Link>
        )}
        {isAdmin && user.name !== 'admin'  && (
            <button
                onClick={() => onDelete(user.id)} // Call the onDelete prop with user ID
                className="btn btn-danger btn-sm"
            >
                Deletar
            </button>
        )}
         {isAdmin && user.name == 'admin'  && (
          <p className="text-muted">Esse admin não pode ser alterado.</p>
      )}
      </td>
  </tr>
    
  );
};

export default UserRow;