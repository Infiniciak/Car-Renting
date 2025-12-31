import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from '../pages/AdminPanel.jsx';
import EmployeePanel from '../pages/EmployeePanel.jsx';
import UserPanel from '../pages/UserPanel.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Profile from '../pages/Profile.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import AdminRentalPoints from '../pages/AdminRentalPoints.jsx';
import UserManagement from '../pages/UserManagement.jsx';
import PublicRentalPoints from '../pages/PublicRentalPoints.jsx';

// --- FUNKCJA POMOCNICZA: SPRAWDZANIE CZY TOKEN JEST PRAWIDŁOWY ---
const isValidToken = (token) => {
    if (!token) return false;
    if (token === 'undefined') return false;
    if (token === 'null') return false;
    if (token === '[object Object]') return false;
    return true;
};

function App() {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role')
    });

    const refreshAuth = () => {
        setAuth({
            token: localStorage.getItem('token'),
            role: localStorage.getItem('role')
        });
    };

    useEffect(() => {
        window.addEventListener('storage', refreshAuth);
        return () => window.removeEventListener('storage', refreshAuth);
    }, []);

    // --- ZABEZPIECZONY ROUTE ---
    const ProtectedRoute = ({ children }) => {
        const token = localStorage.getItem('token');
        
        if (!isValidToken(token)) {
            // Jeśli token jest śmieciem, czyścimy go i wyrzucamy do logowania
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login onLoginSuccess={refreshAuth} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/offer" element={<PublicRentalPoints />} />

                <Route path="/dashboard" element={<DashboardRedirect />} />

                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute><AdminPanel onLogout={refreshAuth} /></ProtectedRoute>} />
                <Route path="/employee" element={<ProtectedRoute><EmployeePanel onLogout={refreshAuth} /></ProtectedRoute>} />
                <Route path="/user" element={<ProtectedRoute><UserPanel onLogout={refreshAuth} /></ProtectedRoute>} />

                <Route path="/admin/rental-points" element={<ProtectedRoute><AdminRentalPoints onLogout={refreshAuth} /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><UserManagement onLogout={refreshAuth} /></ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

// --- ZABEZPIECZONY REDIRECT (TUTAJ BYŁA PĘTLA) ---
const DashboardRedirect = () => {
    const token = localStorage.getItem('token');
    let role = localStorage.getItem('role');

    // Jeśli token jest "undefined" lub go nie ma -> Logowanie
    if (!isValidToken(token)) {
        localStorage.clear(); // Czyścimy błędny stan
        return <Navigate to="/login" replace />;
    }
    
    // Jeśli rola jest "obiektem" (błąd Laravel Enum) -> Logowanie
    if (role === '[object Object]') {
         localStorage.clear();
         return <Navigate to="/login" replace />;
    }

    // Normalizacja roli
    role = role ? role.trim() : '';

    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'employee') return <Navigate to="/employee" replace />;
    
    return <Navigate to="/user" replace />;
};

export default App;