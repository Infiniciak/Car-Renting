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
    // Dodaj prostą walidację w handleReset przed wysłaniem:
const handleReset = async (e) => {
    e.preventDefault();
    
    // Walidacja po stronie klienta (dodatkowa)
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
        alert("Sukces!");
        navigate('/login');
    } catch (err) {
        alert(err.response?.data?.message || "Błąd resetowania");
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Reset Hasła</h2>
                    <p className="text-gray-500 mt-2 font-medium">
                        {step === 1 ? "Podaj swój e-mail" : "Wpisz kod i nowe hasło"}
                    </p>
                </div>
                
                {message && (
                    <div className="mb-6 p-4 bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-bold border border-indigo-100">
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestCode} className="space-y-4">
                        <input 
                            type="email" 
                            placeholder="Twój adres e-mail" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        />
                        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                            Wyślij kod
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Kod (123456)" 
                            required 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        />
                        <input 
                            type="password" 
                            placeholder="Nowe Hasło" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        />
                        <input 
                            type="password" 
                            placeholder="Powtórz Nowe Hasło" 
                            required 
                            value={passwordConfirmation} 
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                        />
                        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                            Zmień hasło
                        </button>
                    </form>
                )}
                
                <div className="mt-8 text-center border-t border-gray-50 pt-6">
                    <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                        Wróć do logowania
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;