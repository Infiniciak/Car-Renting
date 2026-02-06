import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        onLogout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* NAWIGACJA */}
            <nav className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-bold shadow-sm shadow-indigo-200">ADMIN</span>
                    <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">System Zarządzania</span>
                </div>

                <div className="flex items-center gap-6">
                    {/* NOWY PRZYCISK: Zarządzanie Użytkownikami w Navibarze */}
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Baza Użytkowników
                    </button>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition"
                    >
                        Statystyki
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition"
                    >
                        Ustawienia Profilu
                    </button>

                     <button
                        onClick={() => navigate('/admin/promo-codes')}
                        className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition"
                    >
                        Wygeneruj Kody Promocyjne
                    </button>

                    <button
                        onClick={handleLogout}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition border border-red-100 dark:border-red-900"
                    >
                        Wyloguj się
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-8">
                {/* STATYSTYKI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-wider">Użytkownicy</h3>
                        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">124</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-wider">Pojazdy</h3>
                        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">42</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-wider">Przychód (mc)</h3>
                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">12 450 PLN</p>
                    </div>
                </div>

                <h2 className="text-xl font-black mb-6 text-gray-800 dark:text-white uppercase tracking-tight">Moduły Zarządzania</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

                    {/* MODUŁ: Punkty Wypożyczeń */}
                    <div
                        onClick={() => navigate('/admin/rental-points')}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between"
                    >
                        <div>
                            <h3 className="text-gray-800 dark:text-white font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Punkty Wypożyczeń</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Zarządzaj lokalizacjami</p>
                        </div>
                        <span className="text-3xl bg-indigo-50 p-3 rounded-xl group-hover:scale-110 transition">📍</span>
                    </div>

                    {/* MODUŁ: Zarządzanie Użytkownikami */}
                    <div
                        onClick={() => navigate('/admin/users')}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between"
                    >
                        <div>
                            <h3 className="text-gray-800 dark:text-white font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Zarządzanie Kadrami</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Role i uprawnienia</p>
                        </div>
                        <span className="text-3xl bg-blue-50 p-3 rounded-xl group-hover:scale-110 transition">👥</span>
                    </div>

                    {/* MODUŁ: Samochody */}
                    <div
                        onClick={() => navigate('/admin/cars')}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between"
                    >
                        <div>
                            <h3 className="text-gray-800 dark:text-white font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Zarządzanie Pojazdami</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Dodaj i edytuj samochody</p>
                        </div>
                        <span className="text-3xl bg-emerald-50 p-3 rounded-xl group-hover:scale-110 transition">🚗</span>
                    </div>

                    <div
                        onClick={() => navigate('/admin/rentals')}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group flex items-center justify-between"
                    >
                        <div>
                            <h3 className="text-gray-800 dark:text-white font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Zarządzanie Rezerwacjami</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Dodaj i edytuj rezerwacje</p>
                        </div>
                        <span className="text-3xl bg-emerald-50 p-3 rounded-xl group-hover:scale-110 transition">🚗</span>
                    </div>

                </div>

                {/* OSTATNIE DZIAŁANIA */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Ostatnie działania</h2>
                    <div className="text-gray-400 dark:text-gray-500 text-center py-16 border-2 border-dashed border-gray-50 dark:border-gray-700 rounded-2xl font-medium">
                        System monitoruje aktywność. Brak nowych powiadomień.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
