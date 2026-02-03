import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CarListing = () => {
    const [carsData, setCarsData] = useState({ data: [], links: [] });
    const [rentalPoints, setRentalPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        max_price: 1500,
        fuel_type: '',
        rental_point_id: '',
        page: 1
    });

    const navigate = useNavigate();
    const STORAGE_URL = 'http://localhost:8000/storage/';
    const [compareList, setCompareList] = useState([]);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/rental-points');
                setRentalPoints(res.data.data || res.data);
            } catch (err) {
                console.error("Błąd pobierania punktów", err);
            }
        };
        fetchPoints();
    }, []);

    const toggleCompare = (car) => {
        if (compareList.find(c => c.id === car.id)) {
            setCompareList(compareList.filter(c => c.id !== car.id));
        } else {
            if (compareList.length < 3) {
                setCompareList([...compareList, car]);
            } else {
                alert("Możesz porównać maksymalnie 3 samochody.");
            }
        }
    };

    const fetchCars = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8000/api/cars', {
                params: {
                    search: filters.search,
                    max_price: filters.max_price,
                    fuel_type: filters.fuel_type,
                    rental_point_id: filters.rental_point_id,
                    page: filters.page
                }
            });
            setCarsData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Błąd pobierania oferty", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchCars(), 300);
        return () => clearTimeout(timer);
    }, [filters]);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span>🚗</span> CarRent
                    </h1>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/offer')} className="text-gray-600 font-bold hover:text-indigo-600 transition">
                            Punkty
                        </button>
                        <button onClick={() => navigate('/login')} className="bg-gray-900 text-white px-5 py-2 rounded-full font-bold hover:bg-gray-800 transition shadow-lg">
                            Strefa Klienta
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
                <div className="lg:w-1/4 p-6 overflow-y-auto bg-gray-50 border-r border-gray-200 z-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-0">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight">Filtruj ofertę</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Model lub Marka</label>
                                <input
                                    type="text"
                                    placeholder="np. Tesla, BMW..."
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition"
                                    value={filters.search}
                                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Punkt odbioru</label>
                                <select
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none font-medium text-gray-700 transition"
                                    value={filters.rental_point_id}
                                    onChange={(e) => setFilters({...filters, rental_point_id: e.target.value, page: 1})}
                                >
                                    <option value="">Wszystkie punkty</option>
                                    {rentalPoints.map(point => (
                                        <option key={point.id} value={point.id}>
                                            {point.city} - {point.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cena max</label>
                                    <span className="text-indigo-600 font-bold text-sm">{filters.max_price} PLN</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="2000"
                                    step="50"
                                    value={filters.max_price}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    onChange={(e) => setFilters({...filters, max_price: e.target.value, page: 1})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Rodzaj paliwa</label>
                                <select
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none font-medium text-gray-700"
                                    value={filters.fuel_type}
                                    onChange={(e) => setFilters({...filters, fuel_type: e.target.value, page: 1})}
                                >
                                    <option value="">Wszystkie paliwa</option>
                                    <option value="petrol">Benzyna</option>
                                    <option value="electric">Elektryczny</option>
                                    <option value="diesel">Diesel</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-3/4 p-8 overflow-y-auto bg-white">
                    {loading ? (
                         <div className="flex flex-col items-center justify-center h-64">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                             <p className="text-gray-400 italic">Wyszukiwanie idealnego auta...</p>
                         </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {carsData.data.map(car => (
                                    <div key={car.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                                            {car.image_path ? (
                                                <img src={STORAGE_URL + car.image_path} alt={car.model} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">🚗</div>
                                            )}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                                    {car.type}
                                                </div>
                                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                                    {car.year}
                                                </div>
                                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                                    {car.seats} os.
                                                </div>
                                            </div>
                                            {car.rental_point && (
                                                <div className="absolute bottom-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold shadow-lg">
                                                    📍 {car.rental_point.city}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition">{car.brand}</h3>
                                                    <p className="text-gray-400 text-sm font-medium">{car.model}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-gray-900 leading-none">{car.price_per_day}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PLN / doba</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50 mt-auto">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 text-xs">⛽</span>
                                                    <span className="text-xs font-bold text-gray-600 uppercase">{car.fuel_type}</span>
                                                </div>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span className="text-gray-400 text-xs">⚙️</span>
                                                    <span className="text-xs font-bold text-gray-600 uppercase">{car.transmission}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {car.has_gps ? (
                                                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-emerald-100">GPS</span>
                                                ) : null}
                                                {car.has_air_conditioning ? (
                                                    <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-blue-100">Klimatyzacja</span>
                                                ) : null}
                                            </div>

                                            <button onClick={() => navigate(`/car/${car.id}`)} className="w-full mt-4 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Szczegóły</button>
                                            <button
                                                onClick={() => toggleCompare(car)}
                                                className={`mt-2 w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    compareList.find(c => c.id === car.id)
                                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                }`}
                                            >
                                                {compareList.find(c => c.id === car.id) ? "✓ W porównaniu" : "+ Porównaj"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {carsData.links && carsData.links.length > 3 && (
                                <div className="mt-16 flex justify-center gap-2 pb-12">
                                    {carsData.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            onClick={() => {
                                                if (link.url) {
                                                    const urlParams = new URLSearchParams(link.url.split('?')[1]);
                                                    setFilters({...filters, page: urlParams.get('page')});
                                                }
                                            }}
                                            disabled={!link.url || link.active}
                                            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                                                link.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-100'
                                            } ${!link.url && 'opacity-20 cursor-not-allowed'}`}
                                        />
                                    ))}
                                </div>
                            )}
                            {compareList.length > 0 && (
                                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 z-[100] animate-bounce-subtle">
                                    <span className="text-xs font-bold uppercase tracking-widest">Wybrano: {compareList.length}/3</span>
                                    <button onClick={() => navigate('/compare', { state: { cars: compareList } })} className="bg-indigo-600 px-6 py-2 rounded-full font-black text-xs uppercase hover:bg-indigo-500 transition">Porównaj teraz &rarr;</button>
                                    <button onClick={() => setCompareList([])} className="text-gray-500 hover:text-white text-xs">Wyczyść</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarListing;
