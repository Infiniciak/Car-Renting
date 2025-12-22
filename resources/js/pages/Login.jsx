import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => { // <--- Dodaliśmy onLoginSuccess do parametrów
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/login', { email, password });
            
            // 1. Czyścimy stare śmieci
            localStorage.clear(); 

            // 2. Zapisujemy świeże dane z serwera
            const userRole = response.data.role;
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_role', userRole);

            // 3. KLUCZOWY MOMENT: Informujemy App.jsx, że dane się zmieniły
            // Dzięki temu App.jsx odświeży swój stan i wpuści nas do paneli
            if (onLoginSuccess) {
                onLoginSuccess();
            }

            // 4. Przekierowanie
            if (userRole === 'admin') {
                navigate('/admin');
            } else if (userRole === 'employee') {
                navigate('/employee');
            } else {
                navigate('/user');
            }
        } catch (error) {
            console.error(error);
            alert('Błąd logowania! Sprawdź czy dane są poprawne.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Witaj ponownie!</h2>
                    <p className="text-gray-500 mt-2 font-medium">Zaloguj się do swojego panelu sterowania</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3 border-2 border-gray-50 bg-gray-50 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium" 
                            placeholder="twoj@email.com" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Hasło</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 border-2 border-gray-50 bg-gray-50 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium" 
                            placeholder="••••••••" 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-all font-black shadow-lg shadow-indigo-100 active:scale-[0.98]"
                    >
                        Zaloguj się
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <p className="text-sm text-gray-600 font-medium">
                        Nie masz konta? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Zarejestruj się</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;