/**
 * SearchBar.tsx
 * 
 * Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
 * @author Abhiram Ramachandran
 * Date Authored: September 5, 2025
 * Last Date Modified: September 5, 2025
 * 
 * This file exports a UserContext and UserProvider for managing user authentication state.
 * 
 * Dependencies:
 * - @rnmapbox/maps: For rendering maps and handling map-related functionalities.
 */

// TODO: Improve upon this file and interface with backend auth system
import React, { createContext, useContext, useState } from 'react';

export const UserContext = createContext({
  user: null,
  setUser: (user: any) => {},
  isAuthenticated: false,
  login: (user: any) => {},
  logout: () => {},
});

export default function UserProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    const endpoint = `${url}/authenticate`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        credentials: 'include',
        body: JSON.stringify({
          username: username, 
          password: password})
      })

      if (response.ok) {
        const data = await response.json();
        console.log("Login response data:", data);
          setUser({
            username: data.username,
            center: data.center ?? -1,
            points: data.points ?? 0,
            isVerified: data.isVerified ?? false,
            verificationLevel: data.verificationLevel ?? 0,
            exists: true,
            isActive: data.isActive ?? false,
            id: data._id,
            events: data.events ?? []
          });
      } else {
        throw new Error('Login failed');
      }
    } catch(error) {
        console.error("Login error:", error);
        setError(error.message);
    } finally { 
        setLoading(false); 
    }
  };

  const logout = async () => {
    const endpoint = `${url}/deauthenticate`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST', 
        credentials: 'include', 
      });
      if (response.ok) {
        setUser(null);
        setError(null);
      }
      throw new Error('Logout failed');
    } catch(error) {
        setError(error.message);
    }
  };
  // TODO: Implement signup function with onboarding flow
  const signup = async (username: string, password: string) => {

  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Usage in a component:
const { user, isAuthenticated, login, logout } = useContext(UserContext);