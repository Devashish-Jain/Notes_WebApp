import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';
import { AuthProvider, useAuth } from './services/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotesDashboardPage from './pages/NotesDashboardPage';
import SharedNotePage from './pages/SharedNotePage';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <AuthProvider>
            <ParallaxProvider>
                <Router>
                    <MainLayout>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route 
                                path="/login" 
                                element={
                                    <PublicRoute>
                                        <LoginPage />
                                    </PublicRoute>
                                } 
                            />
                            <Route 
                                path="/register" 
                                element={
                                    <PublicRoute>
                                        <RegisterPage />
                                    </PublicRoute>
                                } 
                            />
                            
                            {/* Protected Routes */}
                            <Route 
                                path="/dashboard" 
                                element={
                                    <ProtectedRoute>
                                        <NotesDashboardPage />
                                    </ProtectedRoute>
                                } 
                            />
                            
                            {/* Shared Note Route (Public) */}
                            <Route path="/shared/:shareId" element={<SharedNotePage />} />
                            
                            {/* Catch all route */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </MainLayout>
                </Router>
            </ParallaxProvider>
        </AuthProvider>
    );
}

export default App;
