import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PublicRentalPoints = () => {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [hasCharger, setHasCharger] = useState(false);

    const navigate = useNavigate();
    const STORAGE_URL = 'http://localhost:8000/storage/';

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPoints();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, hasCharger]);

    const fetchPoints = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/rental-points', {
                params: {
                    search: search,
                    has_charger: hasCharger,
                    sort_by: 'created_at',
                    sort_order: 'desc'
                }
            });

            setPoints(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Błąd pobierania ofert", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm p-4 mb-8 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 flex items-center gap-2">
                        <span>🚗</span> CarRent
                    </h1>
                    <button onClick={() => navigate('/login')} className="bg-gray-900 text-white px-5 py-2 rounded-full font-bold hover:bg-gray-800 transition shadow-lg">
                        Strefa Klienta
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Znajdź punkt dla siebie</h2>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Wpisz miasto lub nazwę punktu..."
                                className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition select-none ${hasCharger ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={hasCharger}
                                onChange={(e) => setHasCharger(e.target.checked)}
                            />
                            <span className="font-bold">⚡ Tylko z ładowarką</span>
                        </label>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Ładowanie ofert...</div>
                ) : points.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-xl font-bold text-gray-400">Nie znaleziono punktów pasujących do filtrów.</p>
                        <button onClick={() => {setSearch(''); setHasCharger(false)}} className="mt-4 text-indigo-600 font-bold hover:underline">Wyczyść filtry</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {points.map(point => (
                            <div key={point.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {point.image_path ? (
                                        <img
                                            src={STORAGE_URL + point.image_path}
                                            alt={point.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                            <span className="text-4xl">🏢</span>
                                            <span className="text-xs mt-2">Brak zdjęcia</span>
                                        </div>
                                    )}
                                    {point.has_charging_station && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-indigo-600 px-3 py-1 rounded-full text-xs font-black shadow-sm flex items-center gap-1">
                                            ⚡ EV READY
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{point.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                                        📍 {point.city}, {point.address}
                                    </p>
                                    <button className="w-full bg-gray-50 text-gray-700 font-bold py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition">
                                        Zobacz dostępne auta
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicRentalPoints;
