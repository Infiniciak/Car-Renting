import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


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

    const mapPoints = points
        .filter(p => p.latitude && p.longitude)
        .map(p => ({
            ...p,
            lat: parseFloat(p.latitude),
            lng: parseFloat(p.longitude)
        }));

    const centerPosition = mapPoints.length > 0
        ? [mapPoints[0].lat, mapPoints[0].lng]
        : [52.00, 19.00];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            <nav className="bg-white dark:bg-gray-900 shadow-sm p-4 mb-8 sticky top-0 z-50 border-b border-transparent dark:border-gray-800">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                        <span>🚗</span> CarRent
                    </h1>
                    <button onClick={() => navigate('/login')} className="bg-gray-900 dark:bg-indigo-600 text-white px-5 py-2 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-indigo-500 transition shadow-lg">
                        Strefa Klienta
                    </button>
                </div>
            </nav>

          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)]">

                <div className="lg:w-1/3 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-10">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 sticky top-0 z-20">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Filtry</h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Szukaj miasta..."
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition ${hasCharger ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                <input type="checkbox" className="hidden" checked={hasCharger} onChange={(e) => setHasCharger(e.target.checked)} />
                                <span className="font-bold text-sm">⚡ Tylko z ładowarką</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4 pb-20">
                        {points.map(point => (
                            <div key={point.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition cursor-pointer"
                                 onClick={() => {
                                 }}>
                                <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                                    {point.image_path ? (
                                        <img src={STORAGE_URL + point.image_path} alt={point.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-300">Brak zdjęcia</div>
                                    )}
                                    {point.has_charging_station && <div className="absolute top-2 right-2 bg-white dark:bg-gray-900/80 px-2 py-1 rounded text-xs font-bold text-indigo-600 dark:text-indigo-300">⚡ EV</div>}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 dark:text-white">{point.name}</h3>
                                    <p className="text-gray-500 dark:text-gray-300 text-sm">{point.city}, {point.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                <div className="lg:w-2/3 h-[50vh] lg:h-auto relative z-0">
                    <MapContainer key={centerPosition[0]} center={centerPosition} zoom={6} scrollWheelZoom={true} className="w-full h-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {mapPoints.map(point => (
                            <Marker key={point.id} position={[point.latitude, point.longitude]}>
                                <Popup>
                                    <div className="text-center">
                                        <strong className="block text-sm mb-1">{point.name}</strong>
                                        <span className="text-xs text-gray-500">{point.address}</span>
                                        {point.image_path && (
                                            <img src={STORAGE_URL + point.image_path} className="w-full h-20 object-cover rounded mt-2" />
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

            </div>
        </div>
    );
};

export default PublicRentalPoints
