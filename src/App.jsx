import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@iadefysolutions/design-system';

import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import ResponsiblesList from './components/responsibles/ResponsiblesList';
import RolesList from './components/roles/RolesList';
import ProfilesList from './components/profiles/ProfilesList';
import FunctionsList from './components/functions/FunctionsList';
import MyProfile from './components/profiles/MyProfile';

const App = () => {
    return (
        <ThemeProvider defaultTheme="light">
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Página de login */}
                        <Route path="/login" element={<Login />} />

                        {/* Link de perfil individual — standalone, sem sidebar/menu */}
                        <Route
                            path="/meu-perfil/:id"
                            element={
                                <ProtectedRoute>
                                    <MyProfile />
                                </ProtectedRoute>
                            }
                        />

                        {/* Portal interno — com MainLayout (sidebar + header) */}
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<ResponsiblesList />} />
                            <Route path="funcoes" element={<FunctionsList />} />
                            <Route path="papeis" element={<RolesList />} />
                            <Route path="perfis" element={<ProfilesList />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
