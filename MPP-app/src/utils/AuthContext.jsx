import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  checkAuthStatus: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in (e.g., on page refresh)
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Set up axios interceptor for auth headers
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    
    // Interceptor to handle 401 Unauthorized responses
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user]);
  
  const checkAuthStatus = async () => {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        // Set default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token by making a request to get current user
        const response = await axios.get('http://localhost:8800/auth/me');
        setUser(response.data.user);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      }
    } else {
      setUser(null);
    }
    
    setLoading(false);
  };
  
  const login = async (credentials) => {
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8800/auth/login', credentials);
      
      const { token, user } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setLoading(false);
      
      return { success: true, user };
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  };
  
  const register = async (userData) => {
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8800/auth/register', userData);
      
      const { token, user } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setLoading(false);
      
      return { success: true, user };
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed. Please try again.' 
      };
    }
  };
  
  const logout = () => {
    // Remove token and user info
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear auth header
    delete axios.defaults.headers.common['Authorization'];
    
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 