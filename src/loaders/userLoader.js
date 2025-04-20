import { redirect } from 'react-router-dom';
import UserService from '../services/UserService';

// Loader function to fetch user data for the edit route.
export const userLoader = async ({ params }) => {
  const { userId } = params;
  const token = localStorage.getItem('token');

  // Redirect to signin if authentication token is missing.
  if (!token) {
    return redirect('/signin');
  }

  try {
    const user = await UserService.get(userId, token);
    
    return user; // Return the fetched user data on success.
  } catch (error) {
    console.error('Error loading user:', error);
    // Return null if fetching fails 
    
    return null;
  }
};