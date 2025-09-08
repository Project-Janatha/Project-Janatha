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

const url = 'http://localhost:8008';

export const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
}>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
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
        body: JSON.stringify({username, password})
      })

      const data = await response.json();

      if (response.ok) {
          throw new Error('Login failed');
      }
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
      
    } catch(error) {
        setError(error.message);
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
      loading,
      error,
      login,
      logout,
      signup,
    }}>
      {children}
    </UserContext.Provider>
  );
}


// Usage in a component:
const { user, isAuthenticated, login, logout } = useContext(UserContext);