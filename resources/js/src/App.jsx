import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from '../pages/AdminPanel.jsx';
import EmployeePanel from '../pages/EmployeePanel.jsx';
import UserPanel from '../pages/UserPanel.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';

function App() {
    const role = localStorage.getItem('user_role');
    const token = localStorage.getItem('token');

    // Funkcja pomocnicza do ochrony tras
    const ProtectedRoute = ({ children, allowedRole }) => {
        if (!token) return <Navigate to="/login" />;
        if (allowedRole && role !== allowedRole) return <Navigate to="/dashboard" />;
        return children;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                   !localStorage.getItem('token') ? <Navigate to="/login" /> :
                    localStorage.getItem('user_role') === 'admin' ? <Navigate to="/admin" /> :
                    localStorage.getItem('user_role') === 'employee' ? <Navigate to="/employee" /> :
                    <Navigate to="/user" />
                } />

                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminPanel /></ProtectedRoute>} />
                <Route path="/employee" element={<ProtectedRoute allowedRole="employee"><EmployeePanel /></ProtectedRoute>} />
                <Route path="/user" element={<ProtectedRoute allowedRole="user"><UserPanel /></ProtectedRoute>} />
                
                {/* Domyślna trasa */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;