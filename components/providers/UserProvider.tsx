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
import React, { createContext, useContext, useState, useEffect, use } from 'react';

type User = {
  username: string;
  center: number;
  points: number;
  isVerified: boolean;
  verificationLevel: number;
  exists: boolean;
  isActive: boolean;
  id: string;
  events: any[];
};

const url = 'http://localhost:8008/';

export const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export default function UserProvider({ children }) {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(url + 'authenticate', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({username, password})
      })
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setUser({
            username: data.username,
            center: data.center ?? -1,
            points: data.points ?? 0,
            isVerified: data.isVerified ?? false,
            verificationLevel: data.verificationLevel ?? 0,
            exists: true,
            isActive: data.isActive ?? false,
            id: data.id,
            events: data.events ?? []
          });
        }
      }
      throw new Error('Login failed');
    } catch(error) {
        setError(error);
    } finally { 
      setLoading(false); 
    }
    //   const data = await response.json();
    //   if (!response.ok) {
    //     throw new Error(data.message || 'Login failed');
    //   }
    //   setUser({
    //     username: data.username,
    //     center: data.center ?? -1,
    //     points: data.points ?? 0,
    //     isVerified: data.isVerified ?? false,
    //     verificationLevel: data.verificationLevel ?? 0,
    //     exists: true,
    //     isActive: data.isActive ?? false,
    //     id: data._id,
    //     events: data.events ?? []
    //   });
    //   setError(null);
    // }
    // useEffect(() => {
      // const endpoint = url + 'authenticate';
      // if (!userData) 
      //   fetch(url).then(res => res.json()).then(data => setUser(data.username))
      //   }, [userData]);
    //setUser(userData);
  };

  const logout = () => {
    
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