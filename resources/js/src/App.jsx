import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from '../pages/AdminPanel.jsx';
import EmployeePanel from '../pages/EmployeePanel.jsx';
import UserPanel from '../pages/UserPanel.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Profile from '../pages/Profile.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
function App() {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('user_role')
    });

    // Ta funkcja pozwoli Login.jsx odświeżyć stan całego App
    const refreshAuth = () => {
        setAuth({
            token: localStorage.getItem('token'),
            role: localStorage.getItem('user_role')
        });
    };

    useEffect(() => {
        window.addEventListener('storage', refreshAuth);
        return () => window.removeEventListener('storage', refreshAuth);
    }, []);

    const ProtectedRoute = ({ children, allowedRole }) => {
        if (!auth.token) return <Navigate to="/login" />;
        if (allowedRole && auth.role !== allowedRole) return <Navigate to="/dashboard" />;
        return children;
    };

    return (
        <Router>
            <Routes>
                {/* PRZEKAZUJEMY refreshAuth DO LOGINU */}
                <Route path="/login" element={<Login onLoginSuccess={refreshAuth} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard" element={<DashboardRedirect auth={auth} />} />

                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminPanel onLogout={refreshAuth} /></ProtectedRoute>} />
                <Route path="/employee" element={<ProtectedRoute allowedRole="employee"><EmployeePanel onLogout={refreshAuth} /></ProtectedRoute>} />
                <Route path="/user" element={<ProtectedRoute allowedRole="user"><UserPanel onLogout={refreshAuth} /></ProtectedRoute>} />
                
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}


const DashboardRedirect = ({ auth }) => {
    if (!auth.token) return <Navigate to="/login" />;
    if (auth.role === 'admin') return <Navigate to="/admin" />;
    if (auth.role === 'employee') return <Navigate to="/employee" />;
    return <Navigate to="/user" />;
};

export default App;