import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setFormData({ name: response.data.name, email: response.data.email, password: '' });
            setLoading(false);
        } catch (error) {
            console.error("Błąd pobierania danych profilu", error);
            setLoading(false);
        }
    };

    // --- PUNKT 4: Zaktualizowana funkcja handleUpdate ---
    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        setMessage('');
        
        try {
            const response = await axios.put('http://localhost:8000/api/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(response.data.user);
            setMessage('Profil zaktualizowany pomyślnie!');
            setIsEditing(false);
            
            // Czyścimy pole hasła, żeby nie wisiało tam po zapisie
            setFormData(prev => ({ ...prev, password: '' }));

            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert('Błąd podczas aktualizacji. Hasło musi mieć min. 8 znaków.');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium tracking-widest">ŁADOWANIE PROFILU...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-900">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black uppercase">Mój Profil</h2>
                        <p className="text-indigo-100 opacity-80 text-sm font-bold uppercase tracking-wider">Twoje Centrum Zarządzania</p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => navigate(-1)} 
                        className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl font-bold transition-all text-sm uppercase"
                    >
                        Powrót
                    </button>
                </div>

                <div className="p-10">
                    {message && (
                        <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold flex items-center gap-3">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                            {message}
                        </div>
                    )}

                    {/* Zamiast <form> używamy <div> dla bezpieczeństwa "uciekania" */}
                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Imię i Nazwisko</label>
                            <input
                                type="text"
                                disabled={!isEditing}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={`w-full p-4 rounded-2xl border-2 transition-all outline-none ${
                                    isEditing ? 'border-indigo-100 bg-white focus:border-indigo-500 shadow-sm' : 'border-transparent bg-gray-50 text-gray-500'
                                }`}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Adres E-mail</label>
                            <input
                                type="email"
                                disabled={!isEditing}
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={`w-full p-4 rounded-2xl border-2 transition-all outline-none ${
                                    isEditing ? 'border-indigo-100 bg-white focus:border-indigo-500 shadow-sm' : 'border-transparent bg-gray-50 text-gray-500'
                                }`}
                            />
                        </div>

                        {/* --- PUNKT 3: Pole Nowe Hasło --- */}
                        <div>
                            <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">
                                Nowe Hasło {isEditing && <span className="text-[10px] font-normal text-gray-400 lowercase">(zostaw puste, by nie zmieniać)</span>}
                            </label>
                            <input
                                type="password"
                                disabled={!isEditing}
                                placeholder={isEditing ? "Wpisz nowe hasło..." : "••••••••"}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className={`w-full p-4 rounded-2xl border-2 transition-all outline-none ${
                                    isEditing ? 'border-indigo-100 bg-white focus:border-indigo-500 shadow-sm' : 'border-transparent bg-gray-50 text-gray-500'
                                }`}
                            />
                        </div>

                        {/* Przyciski Akcji */}
                        <div className="pt-6 flex gap-4">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-lg shadow-indigo-100 uppercase"
                                >
                                    Edytuj Dane
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleUpdate}
                                        className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase"
                                    >
                                        Zapisz Zmiany
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: user.name, email: user.email, password: '' });
                                        }}
                                        className="px-8 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all uppercase"
                                    >
                                        Anuluj
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;