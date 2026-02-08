import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const EmployeePanel = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 font-sans transition-colors duration-300">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                
                {/* NAGŁÓWEK */}
                <div className="bg-blue-600 dark:bg-blue-800 px-8 py-4 flex justify-between items-center text-white shadow-md transition-colors duration-300">
                    <h2 className="text-xl font-bold tracking-wide">Panel Pracownika</h2>
                    
                    <div className="flex items-center gap-4">
                        {/* PRZYCISK PROFILU */}
                        <Link 
                            to="/profile" 
                            className="flex items-center gap-2 bg-blue-700 dark:bg-blue-900 hover:bg-blue-800 dark:hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                        >
                            ⚙️ Mój Profil
                        </Link>

                        <button onClick={handleLogout} className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 px-4 py-1.5 rounded-full text-sm font-bold transition shadow-lg">
                            Wyloguj
                        </button>
                    </div>
                </div>

                {/* TREŚĆ */}
                <div className="p-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 transition-colors duration-300">Zadania</h3>
                    
                    {/* Tutaj możesz dać kafelki lub listę */}
                    <ul className="space-y-3">
                        <li className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-l-4 border-emerald-500 shadow-sm dark:shadow-sm/50 transition-colors duration-300">
                            <span className="text-gray-800 dark:text-gray-200 font-medium">✅ Wydanie pojazdu (ID: 45)</span>
                        </li>
                        <li className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-l-4 border-amber-500 shadow-sm dark:shadow-sm/50 transition-colors duration-300">
                            <span className="text-gray-800 dark:text-gray-200 font-medium">⏳ Inspekcja techniczna (Audi A4)</span>
                        </li>
                    </ul>
                    
                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center transition-colors duration-300">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Chcesz zmienić hasło lub włączyć 2FA?</p>
                        <Link to="/profile" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Przejdź do profilu</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeePanel;