import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const Profile = () => {
    // --- STANY ---
    const [user, setUser] = useState({ name: '', email: '' });
    // Rozdzielamy dane haseł, żeby nie mieszać ich z danymi usera
    const [passwords, setPasswords] = useState({ 
        current_password: '', 
        new_password: '', 
        new_password_confirmation: '' 
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Obsługa komunikatów
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // 2FA
    const [twoFactor, setTwoFactor] = useState({ 
        qrUrl: '', 
        code: '', 
        showSetup: false, 
        isEnabled: false 
    });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // --- POBIERANIE DANYCH ---
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser({ name: response.data.name, email: response.data.email });
            // Zakładamy, że backend zwraca status 2FA (jeśli nie, domyślnie false)
            setTwoFactor(prev => ({ ...prev, isEnabled: response.data.two_factor_enabled || false }));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // --- AKTUALIZACJA PROFILU ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage(''); 
        setError('');

        // Prosta walidacja: Jeśli wpisano nowe hasło, stare jest wymagane
        if (passwords.new_password && !passwords.current_password) {
            setError('Aby zmienić hasło, musisz podać obecne hasło.');
            return;
        }

        try {
            // Wysyłamy wszystko razem
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
            
            // Odśwież dane widoczne na ekranie
            setUser({ name: response.data.user.name, email: response.data.user.email });

        } catch (err) {
            // Wyświetl konkretny błąd z Laravela
            setError(err.response?.data?.message || 'Wystąpił błąd podczas zapisu.');
        }
    };

    // --- LOGIKA 2FA ---
    const start2faSetup = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/2fa/generate', { headers: { Authorization: `Bearer ${token}` } });
            setTwoFactor(prev => ({ ...prev, qrUrl: res.data.qr_code_url, showSetup: true }));
        } catch (err) { setError("Błąd generowania QR."); }
    };

    const enable2fa = async () => {
        try {
            await axios.post('http://localhost:8000/api/2fa/enable', { code: twoFactor.code }, { headers: { Authorization: `Bearer ${token}` } });
            setMessage('2FA zostało włączone!');
            setTwoFactor(prev => ({ ...prev, showSetup: false, code: '', isEnabled: true }));
        } catch (err) { setError("Nieprawidłowy kod TOTP."); }
    };

    const disable2fa = async () => {
        if(!window.confirm("Czy na pewno wyłączyć 2FA?")) return;
        try {
            await axios.post('http://localhost:8000/api/2fa/disable', {}, { headers: { Authorization: `Bearer ${token}` } });
            setMessage("2FA zostało wyłączone.");
            setTwoFactor(prev => ({ ...prev, isEnabled: false }));
        } catch (err) { setError("Błąd wyłączania 2FA."); }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Ładowanie...</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-6 font-sans text-gray-100 flex justify-center items-center">
            <div className="max-w-2xl w-full space-y-6">
                
                {/* NAGŁÓWEK */}
                <div className="bg-indigo-600 rounded-2xl p-6 shadow-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-white">Mój Profil</h2>
                        <p className="text-indigo-200 text-sm font-bold">Zarządzanie kontem</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg font-bold text-sm transition">
                        POWRÓT
                    </button>
                </div>

                {/* KOMUNIKATY */}
                {message && <div className="p-4 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-xl font-bold text-center">✅ {message}</div>}
                {error && <div className="p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-xl font-bold text-center">❌ {error}</div>}

                {/* FORMULARZ DANYCH */}
                <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl">
                    <form onSubmit={handleUpdate} className="space-y-5">
                        {/* Imię */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Imię i Nazwisko</label>
                            <input 
                                type="text" 
                                disabled={!isEditing}
                                value={user.name} 
                                onChange={e => setUser({...user, name: e.target.value})}
                                className={`w-full p-3 rounded-xl border mt-1 outline-none transition ${isEditing ? 'bg-gray-700 border-indigo-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                            <input 
                                type="email" 
                                disabled 
                                value={user.email} 
                                className="w-full p-3 rounded-xl border border-gray-700 bg-gray-900 text-gray-500 cursor-not-allowed mt-1"
                            />
                        </div>

                        {/* Zmiana Hasła */}
                        <div className={`pt-4 border-t border-gray-700 ${!isEditing && 'hidden'}`}>
                            <h3 className="text-sm font-bold text-indigo-400 uppercase mb-3">Zmiana Hasła</h3>
                            <div className="space-y-3">
                                <input 
                                    type="password" 
                                    placeholder="Nowe hasło (min. 8 znaków)"
                                    value={passwords.new_password}
                                    onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                                    className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-indigo-500 outline-none"
                                />
                                <input 
                                    type="password" 
                                    placeholder="Potwierdź nowe hasło"
                                    value={passwords.new_password_confirmation}
                                    onChange={e => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                                    className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-indigo-500 outline-none"
                                />
                                <input 
                                    type="password" 
                                    placeholder="Obecne hasło (WYMAGANE do zmian)"
                                    required={!!passwords.new_password} // Wymagane tylko jak zmieniasz hasło
                                    value={passwords.current_password}
                                    onChange={e => setPasswords({...passwords, current_password: e.target.value})}
                                    className="w-full p-3 rounded-xl bg-gray-700 border border-indigo-500 text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder-indigo-300/50"
                                />
                            </div>
                        </div>

                        {/* Przyciski */}
                        <div className="pt-2">
                            {!isEditing ? (
                                <button type="button" onClick={() => setIsEditing(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold uppercase transition">
                                    Edytuj Dane
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold uppercase transition">
                                        Zapisz
                                    </button>
                                    <button type="button" onClick={() => { setIsEditing(false); setPasswords({current_password:'', new_password:'', new_password_confirmation:''}); }} className="px-6 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-xl font-bold uppercase transition">
                                        Anuluj
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* 2FA */}
                <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-black uppercase text-white mb-4 flex items-center gap-2">
                        🛡️ Bezpieczeństwo (2FA)
                    </h3>
                    
                    {twoFactor.isEnabled ? (
                        <div className="flex justify-between items-center bg-emerald-900/30 p-4 rounded-xl border border-emerald-500/30">
                            <span className="text-emerald-400 font-bold text-sm">AKTYWNE</span>
                            <button onClick={disable2fa} className="text-gray-400 hover:text-red-400 underline text-sm font-bold">Wyłącz</button>
                        </div>
                    ) : (
                        <div>
                            {!twoFactor.showSetup ? (
                                <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-dashed border-gray-600">
                                    <span className="text-gray-400 text-sm">Nieaktywne</span>
                                    <button onClick={start2faSetup} className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-indigo-600 hover:text-white transition">Włącz</button>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="bg-white p-3 rounded-xl inline-block">
                                        <QRCodeCanvas value={twoFactor.qrUrl} size={150} />
                                    </div>
                                    <input type="text" maxLength="6" placeholder="000000" value={twoFactor.code} onChange={e => setTwoFactor({...twoFactor, code: e.target.value})} className="block w-full text-center p-3 rounded-xl bg-gray-900 border border-gray-600 text-white text-xl tracking-widest font-mono" />
                                    <button onClick={enable2fa} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold uppercase">Potwierdź</button>
                                    <button onClick={() => setTwoFactor({...twoFactor, showSetup: false})} className="text-gray-500 text-xs font-bold uppercase">Anuluj</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;