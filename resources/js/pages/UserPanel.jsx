import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserPanel = ({ onLogout }) => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchUserData = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/user', config);
            setBalance(res.data.balance);
            setLoading(false);
        } catch (err) {
            console.error("Błąd pobierania salda", err);
            setLoading(false);
        }
    };

    const fetchPromoCodes = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/my-promo-codes', config);
            setPromoCodes(res.data);
        } catch (err) {
            console.error("Błąd pobierania kodów", err);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchPromoCodes();
    }, []);

    const handleUseCode = async (codeId) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/my-promo-codes/${codeId}/use`, {}, config);
            setBalance(res.data.new_balance);
            fetchPromoCodes();
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || "Błąd podczas aktywacji kodu");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        onLogout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <nav className="bg-white dark:bg-gray-800 shadow-sm px-8 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">CAR-RENT</span>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/wizard')} className="bg-indigo-600 dark:bg-indigo-700 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-500 dark:hover:bg-indigo-600 transition shadow-lg shadow-indigo-100 active:scale-95">
                            Pomoc w wyborze
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition"
                    >
                        Mój Profil
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium border-l border-gray-300 dark:border-gray-600 pl-6 transition"
                    >
                        Wyloguj
                    </button>
                </div>
            </nav>

            <main className="p-8 max-w-6xl mx-auto">
                <div className="bg-blue-600 dark:bg-blue-800 rounded-3xl p-10 text-white mb-8 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 transition-colors duration-300">
                    <h1 className="text-4xl font-bold mb-2">Witaj w naszej wypożyczalni!</h1>
                    <p className="text-blue-100 dark:text-blue-200">Znajdź idealne auto na swoją kolejną podróż.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between transition-colors duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Twój Portfel</h2>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-black text-gray-800 dark:text-white">
                                    {loading ? "..." : parseFloat(balance).toFixed(2)}
                                </span>
                                <span className="text-blue-600 dark:text-blue-400 font-bold">PLN</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Twoje Kody Doładowania</h3>
                            {promoCodes.length === 0 ? (
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">Brak dostępnych kodów</p>
                            ) : (
                                <div className="space-y-2 max-h-[90px] overflow-y-auto">
                                    {promoCodes.map(code => (
                                        <div key={code.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{code.code}</span>
                                                {code.status === 'used' && (
                                                    <span className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full font-bold">Użyty</span>
                                                )}
                                                {code.status === 'expired' && (
                                                    <span className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 text-red-600 dark:text-red-400 rounded-full font-bold">Wygasły</span>
                                                )}
                                                {code.status === 'active' && (
                                                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-bold">Dostępny</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-black text-green-600 dark:text-green-400">{code.amount} PLN</span>
                                                {code.status === 'active' && (
                                                    <button
                                                        onClick={() => handleUseCode(code.id)}
                                                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                                                    >
                                                        Użyj
                                                    </button>
                                                )}
                                            </div>
                                            {code.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{code.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between transition-colors duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Twoje Rezerwacje</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                Zarządzaj swoimi aktualnymi wynajmami, przeglądaj historię podróży oraz monitoruj statusy płatności w jednym miejscu.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/user/rentals')}
                            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        >
                            Zobacz rezerwacje &rarr;
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between transition-colors duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Znajdź nas</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                Przeglądaj mapę punktów, sprawdź dostępność ładowarek i wybierz miejsce odbioru.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/offer')}
                            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        >
                            Zobacz Punkty &rarr;
                        </button>
                    </div>
                </div>

                <div className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 text-center transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Gotowy na drogę?</h2>
                    <button
                        onClick={() => navigate('/cars')}
                        className="bg-blue-600 dark:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg shadow-blue-100 dark:shadow-blue-900/30 mb-4"
                    >
                        Przeglądaj samochody
                    </button>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                        Pamiętaj o doładowaniu konta przed wynajmem!
                    </p>
                </div>
            </main>
        </div>
    );
};

export default UserPanel;
