import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserPanel = ({ onLogout }) => { // <--- Odbieramy props
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        onLogout(); // Czyścimy stan w App
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                <span className="text-xl font-black text-blue-600">CAR-RENT</span>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="text-gray-600 hover:text-blue-600 font-semibold transition"
                    >
                        Mój Profil
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="text-gray-600 hover:text-red-600 font-medium border-l pl-6"
                    >
                        Wyloguj
                    </button>
                </div>
            </nav>
            <main className="p-8 max-w-6xl mx-auto">
                <div className="bg-blue-600 rounded-3xl p-10 text-white mb-8">
                    <h1 className="text-4xl font-bold mb-2">Witaj w naszej wypożyczalni!</h1>
                    <p className="text-blue-100">Znajdź idealne auto na swoją kolejną podróż.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">Twoje rezerwacje</h2>
                        <p className="text-gray-500 italic">Nie masz jeszcze żadnych aktywnych rezerwacji.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">Szybki wybór</h2>
                        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                            Przeglądaj samochody
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserPanel;