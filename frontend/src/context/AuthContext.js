import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cryptoherencia_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('cryptoherencia_user', JSON.stringify(userData));
  };

  const logout = async () => {
    // Actualizar actividad antes del logout
    if (user && user.id) {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        await fetch(`${backendUrl}/api/users/${user.id}/activity`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (error) {
        console.error('Error updating activity on logout:', error);
      }
    }
    
    setUser(null);
    localStorage.removeItem('cryptoherencia_user');
  };

  const updateUser = (userData) => {
    // Crear nueva referencia del usuario para forzar re-render
    const updatedUser = { ...userData };
    setUser(updatedUser);
    localStorage.setItem('cryptoherencia_user', JSON.stringify(updatedUser));
  };

  const updateUserActivity = async () => {
    if (!user || !user.id) return;
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      await fetch(`${backendUrl}/api/users/${user.id}/activity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    updateUserActivity,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};