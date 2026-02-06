import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Podanie email, 2: Kod i Nowe Hasło
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // KROK 1: Prośba o kod
    const handleRequestCode = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/forgot-password', { email });
            // Wyświetlamy kod w powiadomieniu (symulacja maila)
            setMessage(`Symulacja: Twój kod resetujący to: ${res.data.code}`);
            setStep(2);
        } catch (err) {
            alert(err.response?.data?.message || "Nie znaleziono użytkownika.");
        }
    };

    // KROK 2: Resetowanie hasła
    const handleReset = async (e) => {
        e.preventDefault();
        
        if (code.length !== 6) {
            alert("Kod musi mieć dokładnie 6 cyfr!");
            return;
        }
        if (password.length < 8) {
            alert("Hasło musi mieć minimum 8 znaków!");
            return;
        }
        if (password !== passwordConfirmation) {
            alert("Hasła nie są identyczne!");
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/reset-password', { 
                email, code, password, password_confirmation: passwordConfirmation 
            });
            alert("Sukces! Hasło zostało zmienione.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Błąd resetowania");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">
                    {step === 1 ? "Reset Hasła" : "Zmiana Hasła"}
                </h2>

                {message && (
                    <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-200 rounded text-center text-sm font-bold transition-colors duration-300">
                        {message}
                    </div>
                )}
                
                {step === 1 ? (
                    <>
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm transition-colors duration-300">
                            Podaj swój adres e-mail, aby otrzymać kod weryfikacyjny.
                        </p>
                        <form onSubmit={handleRequestCode} className="space-y-4">
                            <input 
                                type="email" 
                                placeholder="Twój adres e-mail" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" 
                            />
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200 font-semibold">
                                Wyślij kod
                            </button>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm transition-colors duration-300">
                            Wprowadź kod otrzymany w wiadomości oraz nowe hasło.
                        </p>
                        <input 
                            type="text" 
                            placeholder="Kod (6 cyfr)" 
                            required 
                            maxLength="6"
                            value={code} 
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" 
                        />
                        <input 
                            type="password" 
                            placeholder="Nowe Hasło" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" 
                        />
                        <input 
                            type="password" 
                            placeholder="Powtórz Nowe Hasło" 
                            required 
                            value={passwordConfirmation} 
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-green-500 outline-none transition duration-200" 
                        />
                        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200 font-semibold">
                            Zmień hasło
                        </button>
                    </form>
                )}
                
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    <Link to="/login" className="text-green-600 dark:text-green-400 font-bold hover:underline">
                        Wróć do logowania
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;