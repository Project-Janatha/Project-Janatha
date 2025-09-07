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
import React, { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext({
  user: null,
  setUser: (user: any) => {},
  isAuthenticated: false,
  login: (user: any) => {},
  logout: () => {},
});

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const

  const login = (userData) => {
    useEffect(() => { 
      if (!userData) 
        fetch('http://localhost:8008/register').then(res => res.json()).then(data => setUser(data.username))
        }, [userData]);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
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