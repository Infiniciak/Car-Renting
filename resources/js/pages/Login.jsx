import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_role', response.data.role);
            navigate('/dashboard');
        } catch (error) {
            alert('Błąd logowania!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Witaj ponownie!</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" 
                            placeholder="twoj@email.com" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hasło</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" 
                            placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 font-semibold">
                        Zaloguj się
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Nie masz konta? <Link to="/register" className="text-blue-600 hover:underline">Zarejestruj się</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;