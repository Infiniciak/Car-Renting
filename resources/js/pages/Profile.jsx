import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const Profile = () => {
    // --- STANY ---
    const [user, setUser] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ 
        current_password: '', 
        new_password: '', 
        new_password_confirmation: '' 
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        console.log('📖 Initial theme from localStorage:', savedTheme);
        return savedTheme || 'light';
    });
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [twoFactor, setTwoFactor] = useState({ 
        qrUrl: '', 
        code: '', 
        showSetup: false, 
        isEnabled: false 
    });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleThemeChange = (value) => {
        console.log('🔄 Theme change requested:', value);
        
        try {
            // 1. Zapisz do localStorage
            localStorage.setItem('theme', value);
            console.log('💾 Theme saved to localStorage:', value);
            
            // 2. Wyślij event - App.jsx zastosuje motyw do DOM
            window.dispatchEvent(new CustomEvent('themeChanged', { 
                detail: { theme: value } 
            }));
            console.log('📡 Event dispatched - App.jsx will apply theme');
            
            // 3. Aktualizuj lokalny state (dla UI buttonów)
            setTheme(value);
            
            setError('');
            setMessage(`Motyw zmieniony na ${value === 'dark' ? 'ciemny' : 'jasny'}.`);
            
        } catch (error) {
            console.error('❌ Failed to change theme:', error);
            setError('Nie udało się zmienić motywu.');
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser({ name: response.data.name, email: response.data.email });
            setTwoFactor(prev => ({ ...prev, isEnabled: response.data.two_factor_enabled || false }));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage(''); 
        setError('');

        if (passwords.new_password && !passwords.current_password) {
            setError('Aby zmienić hasło, musisz podać obecne hasło.');
            return;
        }

        try {
            const payload = {
                name: user.name,
                email: user.email,
                ...passwords
            };

            const response = await axios.put('http://localhost:8000/api/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Profil zaktualizowany pomyślnie!');
            setIsEditing(false);
            setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
            setUser({ name: response.data.user.name, email: response.data.user.email });

        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas zapisu.');
        }
    };

    const start2faSetup = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/2fa/generate', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setTwoFactor(prev => ({ ...prev, qrUrl: res.data.qr_code_url, showSetup: true }));
        } catch (err) { 
            setError("Błąd generowania QR."); 
        }
    };

    const enable2fa = async () => {
        try {
            await axios.post('http://localhost:8000/api/2fa/enable', { code: twoFactor.code }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setMessage('2FA zostało włączone!');
            setTwoFactor(prev => ({ ...prev, showSetup: false, code: '', isEnabled: true }));
        } catch (err) { 
            setError("Nieprawidłowy kod TOTP."); 
        }
    };

    const disable2fa = async () => {
        if(!window.confirm("Czy na pewno chcesz wyłączyć weryfikację dwuetapową? Twoje konto będzie mniej bezpieczne.")) return;
        
        setMessage('');
        setError('');
        
        try {
            const res = await axios.post('http://localhost:8000/api/2fa/disable', {}, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            if (res.status === 200) {
                setMessage("2FA zostało wyłączone.");
                setTwoFactor(prev => ({ 
                    ...prev, 
                    isEnabled: false, 
                    qrUrl: '', 
                    showSetup: false 
                }));
            }
        } catch (err) { 
            setError(err.response?.data?.message || "Błąd podczas wyłączania 2FA."); 
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-800 dark:text-white transition-colors duration-300">
                Ładowanie...
            </div>
        );
    }

    console.log('🎨 Profile rendering - theme state:', theme);

    return (
        <div className="profile-page min-h-screen p-6 font-sans flex justify-center items-center transition-colors duration-300 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <div className="w-full max-w-4xl">
                <div className="profile-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur p-6 sm:p-8 space-y-6">

                <div className="profile-card bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 rounded-3xl p-6 shadow-2xl flex justify-between items-center ring-1 ring-indigo-400/40 dark:ring-indigo-300/30">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-white tracking-tight">Mój Profil</h2>
                        <p className="text-indigo-100 text-sm font-semibold">Zarządzanie kontem</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-md ring-1 ring-white/30">
                        POWRÓT
                    </button>
                </div>

                {message && <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200 rounded-xl font-semibold text-center shadow-sm">✅ {message}</div>}
                {error && <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-200 rounded-xl font-semibold text-center shadow-sm">❌ {error}</div>}

                <div className="profile-card bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Imię i Nazwisko</label>
                            <input 
                                type="text" 
                                disabled={!isEditing}
                                value={user.name} 
                                onChange={e => setUser({...user, name: e.target.value})}
                                className={`w-full p-3.5 rounded-2xl border mt-1 outline-none transition shadow-sm ${isEditing ? 'bg-slate-50 dark:bg-slate-800 border-indigo-400 dark:border-indigo-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-400/60' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Email</label>
                            <input 
                                type="email" 
                                disabled 
                                value={user.email} 
                                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed mt-1 shadow-sm"
                            />
                        </div>

                        <div className={`pt-4 border-t border-gray-300 dark:border-gray-700 ${!isEditing && 'hidden'}`}>
                            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3 tracking-wide">Zmiana Hasła</h3>
                            <div className="space-y-3">
                                <input 
                                    type="password" 
                                    placeholder="Nowe hasło (min. 8 znaków)"
                                    value={passwords.new_password}
                                    onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/60 outline-none transition-all shadow-sm"
                                />
                                <input 
                                    type="password" 
                                    placeholder="Potwierdź nowe hasło"
                                    value={passwords.new_password_confirmation}
                                    onChange={e => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/60 outline-none transition-all shadow-sm"
                                />
                                <input 
                                    type="password" 
                                    placeholder="Obecne hasło (WYMAGANE do zmian)"
                                    required={!!passwords.new_password}
                                    value={passwords.current_password}
                                    onChange={e => setPasswords({...passwords, current_password: e.target.value})}
                                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-indigo-400 dark:border-indigo-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-indigo-200/70 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            {!isEditing ? (
                                <button type="button" onClick={() => setIsEditing(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold uppercase transition shadow-lg shadow-indigo-500/20">
                                    Edytuj Dane
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold uppercase transition shadow-md shadow-emerald-500/20">
                                        Zapisz
                                    </button>
                                    <button type="button" onClick={() => { setIsEditing(false); setPasswords({current_password:'', new_password:'', new_password_confirmation:''}); }} className="px-6 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-2xl font-bold uppercase transition-colors border border-slate-300 dark:border-slate-700 shadow-sm">
                                        Anuluj
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="profile-card bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300">
                    <h3 className="text-lg font-black uppercase text-slate-800 dark:text-white mb-2 tracking-tight">🎨 Wygląd aplikacji</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Wybierz preferowany motyw interfejsu.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleThemeChange('dark')}
                            className={`flex-1 py-3 rounded-2xl font-bold uppercase transition shadow-sm ring-1 ${theme === 'dark' ? 'bg-slate-900 text-white ring-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 ring-slate-200 dark:ring-slate-700'}`}
                        >
                            🌙 Ciemny
                        </button>
                        <button
                            type="button"
                            onClick={() => handleThemeChange('light')}
                            className={`flex-1 py-3 rounded-2xl font-bold uppercase transition shadow-sm ring-1 ${theme === 'light' ? 'bg-indigo-600 text-white ring-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 ring-slate-200 dark:ring-slate-700'}`}
                        >
                            ☀️ Jasny
                        </button>
                    </div>
                </div>

                <div className="profile-card bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300">
                    <h3 className="text-lg font-black uppercase text-slate-800 dark:text-white mb-4 flex items-center gap-2 tracking-tight">
                        🛡️ Bezpieczeństwo (2FA)
                    </h3>
                    
                    {twoFactor.isEnabled ? (
                        <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-700 shadow-sm">
                            <span className="text-emerald-700 dark:text-emerald-200 font-bold text-sm">AKTYWNE</span>
                            <button onClick={disable2fa} className="text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 underline text-sm font-bold transition-colors">Wyłącz</button>
                        </div>
                    ) : (
                        <div>
                            {!twoFactor.showSetup ? (
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors shadow-sm">
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">Nieaktywne</span>
                                    <button onClick={start2faSetup} className="bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-indigo-600 hover:text-white transition shadow-sm">Włącz</button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="bg-white p-3 rounded-2xl inline-block shadow-sm">
                                        <QRCodeCanvas value={twoFactor.qrUrl} size={150} />
                                    </div>
                                    <input type="text" maxLength="6" placeholder="000000" value={twoFactor.code} onChange={e => setTwoFactor({...twoFactor, code: e.target.value})} className="block w-full text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xl tracking-widest font-mono transition-colors shadow-sm" />
                                    <button onClick={enable2fa} className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold uppercase shadow-lg shadow-indigo-500/25">Potwierdź</button>
                                    <button onClick={() => setTwoFactor({...twoFactor, showSetup: false})} className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Anuluj</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
