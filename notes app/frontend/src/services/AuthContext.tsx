import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const authAPI = {
    login: async (credentials: LoginCredentials) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
        return response;
    },
    register: async (userData: RegisterData) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
        return response;
    }
};

interface User {
    username: string;
    email: string;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { token, username, email } = response.data;
            
            localStorage.setItem('token', token);
            const userData = { username, email };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            await authAPI.register(userData);
            return { success: true };
        } catch (error: any) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
