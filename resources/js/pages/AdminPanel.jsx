import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    // Dodajemy losowy numer na końcu, żeby przeglądarka "myślała", że to nowa strona
    const cacheBuster = Math.random().toString(36).substring(7);
    window.location.href = `/login?v=${cacheBuster}`;
};

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Panel Administratora</h1>
                            <p className="text-gray-500">Zarządzaj flotą i użytkownikami</p>
                        </div>
                        <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition">
                            Wyloguj się
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h3 className="font-bold text-indigo-900">Użytkownicy</h3>
                            <p className="text-3xl font-black text-indigo-600">124</p>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                            <h3 className="font-bold text-emerald-900">Aktywne auta</h3>
                            <p className="text-3xl font-black text-emerald-600">42</p>
                        </div>
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                            <h3 className="font-bold text-amber-900">Raporty</h3>
                            <p className="text-3xl font-black text-amber-600">8</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;