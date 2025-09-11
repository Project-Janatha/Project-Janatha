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
// TODO: Enable post calls from android and ios to backend server
// TODO: Enable persistent login sessions using cookies or tokens
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
  checkUserExists: (username: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
}>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  loading: false,
  error: null,
  checkUserExists: async () => false,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
});

export default function UserProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUserExists = async (username: string) => {
    const endpoint = `${url}/user-exists`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        credentials: 'include',
        body: JSON.stringify({username: username}),
      });
      const data = await response.json();
      if (response.ok) {
        return data.exists;
      } else {
        const errorMessage = data.message || `Request failed with status ${response.status}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      } 
    } catch(error) {
        console.error("Couldn't fetch from server: ", error);
        setError(error.message);
      }
  };

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
      const data = await response.json();
      if (response.ok) {
        const user = data.user;
        console.log("Login response data:", data);
          setUser({
            username: user.username,
            center: user.center ?? -1,
            points: user.points ?? 0,
            isVerified: user.isVerified ?? false,
            verificationLevel: user.verificationLevel ?? 0,
            exists: true,
            isActive: user.isActive ?? false,
            id: user._id,
            events: user.events ?? []
          });
        } else {
          const errorMessage = data.message || `Request failed with status ${response.status}`;
          setError(errorMessage); // Set the error state in the context
          throw new Error(errorMessage);
        }
    } catch(error) {
        console.error("Login error:", error);
        if (!error.message.includes('Request failed')) {
          setError(error.message);
        }
        throw error;
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
      loading,
      error,
      checkUserExists,
      login,
      logout,
      signup,
    }}>
      {children}
    </UserContext.Provider>
  );
}
