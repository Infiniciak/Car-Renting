import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = ({ onLogout }) => { // <--- Odbieramy props
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        onLogout(); // Czyścimy stan w App
        navigate('/login'); // Przekierowujemy
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-bold">ADMIN</span>
                    <span className="text-xl font-bold text-gray-800">System Zarządzania</span>
                </div>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="text-gray-600 hover:text-indigo-600 font-semibold transition"
                    >
                        Ustawienia Profilu
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
                    >
                        Wyloguj się
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Użytkownicy</h3>
                        <p className="text-3xl font-black text-gray-900">124</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Pojazdy</h3>
                        <p className="text-3xl font-black text-gray-900">42</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Przychód (mc)</h3>
                        <p className="text-3xl font-black text-emerald-600">12 450 PLN</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Ostatnie działania</h2>
                    <div className="text-gray-500 text-center py-10 border-2 border-dashed rounded-xl">
                        Brak nowych powiadomień systemowych.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;