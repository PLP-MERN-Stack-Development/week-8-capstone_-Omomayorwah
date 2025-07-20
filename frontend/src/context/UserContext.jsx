import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login and auto-refresh from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('lernbase_user');
    const storedToken = localStorage.getItem('lernbase_token');
    const storedRefresh = localStorage.getItem('lernbase_refresh');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRefreshToken(storedRefresh);
    }
    // Try to refresh token if refreshToken exists
    if (!storedToken && storedRefresh) {
      api.refreshToken(storedRefresh)
        .then(res => {
          setToken(res.data.tokens.accessToken);
          setRefreshToken(res.data.tokens.refreshToken);
          localStorage.setItem('lernbase_token', res.data.tokens.accessToken);
          localStorage.setItem('lernbase_refresh', res.data.tokens.refreshToken);
        })
        .catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = (userData, tokens) => {
    setUser(userData);
    setToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    localStorage.setItem('lernbase_user', JSON.stringify(userData));
    localStorage.setItem('lernbase_token', tokens.accessToken);
    localStorage.setItem('lernbase_refresh', tokens.refreshToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('lernbase_user');
    localStorage.removeItem('lernbase_token');
    localStorage.removeItem('lernbase_refresh');
  };

  return (
    <UserContext.Provider value={{ user, token, refreshToken, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 