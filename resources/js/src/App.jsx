import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from '../pages/AdminPanel.jsx';
import EmployeePanel from '../pages/EmployeePanel.jsx';
import UserPanel from '../pages/UserPanel.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';

function App() {
    // FUNKCJA POMOCNICZA - teraz sprawdza dane ZA KAŻDYM RAZEM
    const ProtectedRoute = ({ children, allowedRole }) => {
        const currentToken = localStorage.getItem('token');
        const currentRole = localStorage.getItem('user_role');

        if (!currentToken) {
            return <Navigate to="/login" />;
        }

        if (allowedRole && currentRole !== allowedRole) {
            return <Navigate to="/dashboard" />;
        }

        return children;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard" element={<DashboardRedirect />} />

                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminPanel /></ProtectedRoute>} />
                <Route path="/employee" element={<ProtectedRoute allowedRole="employee"><EmployeePanel /></ProtectedRoute>} />
                <Route path="/user" element={<ProtectedRoute allowedRole="user"><UserPanel /></ProtectedRoute>} />
                
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

// Wydzielona logika dashboardu, żeby zawsze czytała świeże dane
const DashboardRedirect = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');

    if (!token) return <Navigate to="/login" />;
    if (role === 'admin') return <Navigate to="/admin" />;
    if (role === 'employee') return <Navigate to="/employee" />;
    return <Navigate to="/user" />;
};

export default App;