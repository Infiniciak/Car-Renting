import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/register', formData);
            alert('Rejestracja pomyślna!');
            navigate('/login');
        } catch (error) {
            alert('Błąd rejestracji!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">Utwórz konto</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input type="text" placeholder="Imię i nazwisko" 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" required />
                    
                    <input type="email" placeholder="Email" 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" required />
                    
                    <input type="password" placeholder="Hasło" 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" required />
                    
                    <input type="password" placeholder="Potwierdź hasło" 
                        onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" required />
                    
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200 font-semibold">
                        Zarejestruj się
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Masz już konto? <Link to="/login" className="text-green-600 dark:text-green-400 hover:underline">Zaloguj się</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;