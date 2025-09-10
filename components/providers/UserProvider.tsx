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
        body: JSON.stringify({
          username: username, 
          password: password})
      })

      if (response.ok) {
        const data = await response.json();
        const user = data.userObject;
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
