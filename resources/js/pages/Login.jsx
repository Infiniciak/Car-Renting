import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [is2faRequired, setIs2faRequired] = useState(false);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    // --- LOGIKA LOGOWANIA (ZABEZPIECZONA PRZED PĘTLĄ) ---
    const loginSuccess = (data) => {
        console.log("Logowanie - dane z backendu:", data);

        // 1. ZABEZPIECZENIE: Sprawdzamy czy token istnieje i nie jest "undefined"
        if (!data.token || data.token === 'undefined') {
            setError('Błąd krytyczny: Serwer nie zwrócił tokena autoryzacji.');
            return;
        }

        // 2. ZABEZPIECZENIE: Naprawa roli (gdyby Laravel wysłał obiekt Enuma)
        let roleToSave = 'user';
        if (data.role) {
             if (typeof data.role === 'object') {
                 roleToSave = data.role.value || 'user'; 
             } else {
                 roleToSave = data.role;
             }
        }

        // Zapisujemy poprawne dane
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', roleToSave);
        
        // Odświeżamy stan w App.jsx
        if (onLoginSuccess) onLoginSuccess();
        
        // Przekierowanie zależne od roli
        if (roleToSave === 'admin') navigate('/admin');
        else if (roleToSave === 'employee') navigate('/employee');
        else navigate('/user');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/login', { email, password });
            
            if (response.data.status === '2fa_required') {
                setUserId(response.data.user_id);
                setIs2faRequired(true);
            } else {
                loginSuccess(response.data);
            }
        } catch (err) {
            console.error(err);
            setError('Błędne dane logowania');
        }
    };

    const handle2faVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:8000/api/2fa/verify-login', {
                user_id: userId,
                code: code
            });
            loginSuccess(response.data);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Kod nieprawidłowy';
            setError(msg);
        }
    };

    // --- WYGLĄD DOPASOWANY DO REGISTER.JSX ---
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">
                    {is2faRequired ? 'Weryfikacja 2FA' : 'Zaloguj się'}
                </h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded text-center text-sm font-bold transition-colors duration-300">
                        {error}
                    </div>
                )}
                
                {!is2faRequired ? (
                    <>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input 
                                type="email" 
                                placeholder="Email" 
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                            <input 
                                type="password" 
                                placeholder="Hasło" 
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200 font-semibold">
                                Zaloguj się
                            </button>
                        </form>

                        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 flex flex-col gap-2 transition-colors duration-300">
                            <Link to="/forgot-password" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">
                                Zapomniałeś hasła?
                            </Link>
                            <p>
                                Nie masz konta?{' '}
                                <Link to="/register" className="text-green-600 dark:text-green-400 font-bold hover:underline">
                                    Zarejestruj się
                                </Link>
                            </p>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handle2faVerify} className="space-y-4">
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-2 text-sm transition-colors duration-300">
                            Wprowadź kod z aplikacji Google Authenticator
                        </p>
                        <input 
                            type="text" 
                            placeholder="000000" 
                            maxLength="6"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest font-mono focus:ring-green-500 outline-none transition duration-200" 
                            onChange={(e) => setCode(e.target.value)} 
                            required 
                            autoFocus 
                        />
                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200 font-semibold">
                            Potwierdź
                        </button>
                        <button 
                            type="button" 
                            onClick={() => window.location.reload()} 
                            className="w-full text-gray-500 dark:text-gray-400 text-sm mt-2 hover:underline transition-colors duration-300"
                        >
                            Anuluj
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;