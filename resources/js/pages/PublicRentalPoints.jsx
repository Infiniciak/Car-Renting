import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo([coords.lat, coords.lng], 14, { duration: 1.5 });
        }
    }, [coords, map]);
    return null;
};

const PublicRentalPoints = () => {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [hasCharger, setHasCharger] = useState(false);

    const [mapTarget, setMapTarget] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [destination, setDestination] = useState("");

    const navigate = useNavigate();
    const STORAGE_URL = 'http://localhost:8000/storage/';

    useEffect(() => {
        fetchPoints(null, null, currentPage);
    }, [search, hasCharger, currentPage]);


    const handleFindNearest = () => {
        if (!navigator.geolocation) {
            alert("Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await fetchPoints(latitude, longitude);
                setIsLocating(false);
            },
            () => setIsLocating(false),
            { enableHighAccuracy: true }
        );
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const radlat1 = Math.PI * lat1 / 180;
        const radlat2 = Math.PI * lat2 / 180;
        const theta = lon1 - lon2;
        const radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515 * 1.609344;
        return dist;
};

    const fetchPoints = async (lat = null, lng = null, pageNum = 1) => {
    setLoading(true);
    try {
        const params = {
            search: search,
            has_charger: hasCharger ? 1 : 0,
            page: pageNum,
            sort_by: 'created_at',
            sort_order: 'desc'
        };

        const response = await axios.get('http://localhost:8000/api/rental-points', { params });
        const fetchedData = response.data.data || [];
        const lastPage = response.data.last_page || 1;
        setPoints(fetchedData);
        setTotalPages(lastPage);
        setCurrentPage(pageNum);
       if (lat && lng && fetchedData.length > 0 && pageNum === 1) {
            let closest = fetchedData[0];
            let minDistance = getDistance(lat, lng, parseFloat(closest.latitude), parseFloat(closest.longitude));

            fetchedData.forEach(point => {
                const d = getDistance(lat, lng, parseFloat(point.latitude), parseFloat(point.longitude));
                if (d < minDistance) {
                    minDistance = d;
                    closest = point;
                }
            });

            setMapTarget({ lat: parseFloat(closest.latitude), lng: parseFloat(closest.longitude) });
        }
    } catch (error) {
        console.error("Błąd paginacji", error);
    } finally {
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


    const handleSearchDestination = async () => {
    if (!destination) return;
        setIsLocating(true);
        try {

            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: destination,
                    format: 'json',
                    addressdetails: 1,
                    limit: 1
                }
            });

            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                const targetLat = parseFloat(lat);
                const targetLng = parseFloat(lon);

                setMapTarget({ lat: targetLat, lng: targetLng });


                await fetchPoints(targetLat, targetLng, 1);
            } else {
                alert("Nie znaleziono podanego adresu.");
            }
        } catch (error) {
            console.error("Błąd wyszukiwania adresu:", error);
            alert("Wystąpił błąd podczas wyszukiwania.");
        } finally {
            setIsLocating(false);
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

          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)]">

                <div className="lg:w-1/3 p-4 overflow-y-auto bg-gray-50 border-r border-gray-200 z-10">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 top-0 z-20">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Filtry</h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Szukaj miasta..."
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition ${hasCharger ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                                <input type="checkbox" className="hidden" checked={hasCharger} onChange={(e) => setHasCharger(e.target.checked)} />
                                <span className="font-bold text-sm">⚡ Tylko z ładowarką</span>
                            </label>
                            <button
                                onClick={handleFindNearest}
                                disabled={isLocating}
                                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {isLocating ? "Namierzanie..." : "📍 Znajdź najbliżej mnie"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="font-bold mb-4 text-gray-800">Planujesz podróż?</h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Wpisz cel podróży (np. Poznań, Dworzec)..."
                                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchDestination()}
                            />
                            <button
                                onClick={handleSearchDestination}
                                disabled={isLocating || !destination}
                                className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition shadow-md active:scale-95 disabled:opacity-50"
                            >
                                🔍 Znajdź punkty zwrotu u celu
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 pb-20">
                        {points.map(point => (
                            <div key={point.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"
                                 onClick={() => {
                                    setMapTarget({ lat: point.lat, lng: point.lng });
                                 }}>
                                <div className="h-32 bg-gray-200 relative">
                                    {point.image_path ? (
                                        <img src={STORAGE_URL + point.image_path} alt={point.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">Brak zdjęcia</div>
                                    )}
                                    {point.has_charging_station && <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold text-indigo-600">⚡ EV</div>}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800">{point.name}</h3>
                                    <p className="text-gray-500 text-sm">{point.city}, {point.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>


                <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-20">
                        <button
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-200 transition font-bold text-sm"
                        >
                            ⬅️ Poprzednia
                        </button>
                        <span className="text-sm font-bold text-gray-600">
                            Strona {currentPage} z {totalPages}
                        </span>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-200 transition font-bold text-sm"
                        >
                            Następna ➡️
                        </button>
                    </div>
                </div>


                <div className="lg:w-2/3 h-[50vh] lg:h-auto relative z-0">
                    <MapContainer key={centerPosition[0]} center={centerPosition} zoom={6} scrollWheelZoom={true} className="w-full h-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <RecenterMap coords={mapTarget} />
                        {mapPoints.map(point => (
                            <Marker
                                key={point.id}
                                position={[point.lat, point.lng]}
                            >
                                <Popup>
                                    <strong>{point.name}</strong><br/>
                                    {point.city}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};


export default PublicRentalPoints;
