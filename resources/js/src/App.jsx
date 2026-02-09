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
import PublicRentalPoints from '../pages/PublicRentalPoints.jsx';
import UserManagement from '../pages/UserManagement.jsx';
import AdminCars from '../pages/AdminCars.jsx';
import AdminRentals from '../pages/AdminRentals.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import PublicCarListing from '../pages/PublicCarListing.jsx';
import PublicCarDetails from '../pages/PublicCarDetails.jsx';
import CarComparison from '../pages/CarComparison.jsx';
import CarWizard from '../pages/CarWizard.jsx';
import RentalBooking from '../pages/RentalBooking.jsx';
import UserRentals from '../pages/UserRentals.jsx';
import AdminPromoCodes from '../pages/AdminPromoCodes.jsx';
import NotFound from '../pages/NotFound.jsx';

// --- FUNKCJA POMOCNICZA: SPRAWDZANIE CZY TOKEN JEST PRAWIDŁOWY ---
const isValidToken = (token) => {
    if (!token) return false;
    if (token === 'undefined') return false;
    if (token === 'null') return false;
    if (token === '[object Object]') return false;
    return true;
};

// --- FUNKCJA APLIKUJĄCA MOTYW ---
const applyTheme = (theme) => {
    console.log('🎨 Applying theme to DOM:', theme);
    
    const root = document.documentElement;
    
    // 1. Usuń obie klasy
    root.classList.remove('dark', 'light');
    
    // 2. Ustaw data-theme
    root.setAttribute('data-theme', theme);

    // 3. Dodaj odpowiednią klasę
    if (theme === 'dark') {
        root.classList.add('dark');
        console.log('✅ Dark mode applied');
        // Usuń light mode overrides jeśli były
        const lightStyle = document.getElementById('light-mode-overrides');
        if (lightStyle) lightStyle.remove();
    } else {
        root.classList.add('light');
        console.log('✅ Light mode applied');
    }
    
    // 4. Wymuś reflow
    void root.offsetHeight;
    
    console.log('✓ Theme applied - classList:', root.classList.toString());
};

function App() {
    console.log('🚀 App component rendered');
    
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

    // --- USTAWIENIE MOTYWU NA STARCIE I NASŁUCHIWANIE ZMIAN ---
    useEffect(() => {
        console.log('🎬 Theme useEffect mounted');
        
        // Zastosuj motyw przy pierwszym załadowaniu
        const theme = localStorage.getItem('theme') || 'light';
        console.log('📖 Loading initial theme:', theme);
        applyTheme(theme);
        
        // Słucha custom event'u 'themeChanged' z Profile.jsx
        const handleThemeChanged = (e) => {
            console.log('📨 Received themeChanged event:', e.detail);
            applyTheme(e.detail.theme);
        };
        
        window.addEventListener('themeChanged', handleThemeChanged);
        console.log('👂 Listening for themeChanged events');
        
        return () => {
            console.log('🔌 Removing themeChanged listener');
            window.removeEventListener('themeChanged', handleThemeChanged);
        };
    }, []);

    // --- ZABEZPIECZONY ROUTE ---
    const ProtectedRoute = ({ children, allowedRole }) => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!isValidToken(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            return <Navigate to="/login" replace />;
        }

        if (allowedRole && role !== allowedRole) {
            return <Navigate to="/dashboard" replace />;
        }

        return children;
    };

    return (
        <Router>
            <Routes>
                {/* PUBLICZNE STRONY */}
                <Route path="/login" element={<Login onLoginSuccess={refreshAuth} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/offer" element={<PublicRentalPoints />} />
                <Route path="/cars" element={<PublicCarListing />} />
                <Route path="/car/:id" element={<PublicCarDetails />} />
                <Route path="/compare" element={<CarComparison />} />
                <Route path="/wizard" element={<CarWizard />} />

                {/* STRONY UŻYTKOWNIKA */}
                <Route path="/rental/:carId" element={
                    <ProtectedRoute>
                        <RentalBooking />
                    </ProtectedRoute>
                } />
                <Route path="/user/rentals" element={
                    <ProtectedRoute>
                        <UserRentals />
                    </ProtectedRoute>
                } />

                {/* PROFIL */}
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                {/* DASHBOARD */}
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* PANEL ADMINA */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminPanel onLogout={refreshAuth} />
                    </ProtectedRoute>
                } />

                <Route path="/admin/rental-points" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminRentalPoints onLogout={refreshAuth} />
                    </ProtectedRoute>
                } />

                <Route path="/admin/users" element={
                    <ProtectedRoute allowedRole="admin">
                        <UserManagement onLogout={refreshAuth} />
                    </ProtectedRoute>
                } />

                <Route path="/admin/cars" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminCars onLogout={refreshAuth} />
                    </ProtectedRoute>
                } />

                <Route path="/admin/rentals" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminRentals onLogout={refreshAuth} />
                    </ProtectedRoute>
                } />

                <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/admin/promo-codes" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminPromoCodes onLogout={refreshAuth} />
                    </ProtectedRoute>
                } />

                {/* PANEL PRACOWNIKA */}
                <Route path="/employee" element={
                    <ProtectedRoute allowedRole="employee">
                        <EmployeePanel onLogout={refreshAuth} />
                    </ProtectedRoute>
                } />

                {/* PANEL UŻYTKOWNIKA */}
                <Route path="/user" element={
                    <ProtectedRoute allowedRole="user">
                        <UserPanel onLogout={refreshAuth} />
                    </ProtectedRoute>
                } />

                {/* REDIRECT GŁÓWNY */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

// --- ZABEZPIECZONY REDIRECT ---
const DashboardRedirect = () => {
    const token = localStorage.getItem('token');
    let role = localStorage.getItem('role');

    if (!isValidToken(token)) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    if (role === '[object Object]') {
         localStorage.clear();
         return <Navigate to="/login" replace />;
    }

    role = role ? role.trim() : '';

    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'employee') return <Navigate to="/employee" replace />;

    return <Navigate to="/user" replace />;
};

export default App;
