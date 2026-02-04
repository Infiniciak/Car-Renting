import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CarListing = () => {
    const [carsData, setCarsData] = useState({ data: [], links: [] });
    const [rentalPoints, setRentalPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    // Rozbudowany stan filtrów
    const [filters, setFilters] = useState({
        search: '',
        max_price: 2000,
        fuel_type: '',
        rental_point_id: '',
        type: '',
        transmission: '',
        seats: '',
        has_gps: false,
        has_air_conditioning: false,
        start_date: '', // Nowość: Data rozpoczęcia
        end_date: '',   // Nowość: Data zakończenia
        page: 1
    });

    const navigate = useNavigate();
    const STORAGE_URL = 'http://localhost:8000/storage/';
    const [compareList, setCompareList] = useState([]);

    // Pobieranie punktów odbioru
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

    // Główna funkcja pobierająca auta
    const fetchCars = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8000/api/cars', {
                params: { ...filters }
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

    // Debouncing i auto-odświeżanie po zmianie filtrów
    useEffect(() => {
        const timer = setTimeout(() => fetchCars(), 300);
        return () => clearTimeout(timer);
    }, [filters]);

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

    const resetFilters = () => {
        setFilters({
            search: '', max_price: 2000, fuel_type: '', rental_point_id: '',
            type: '', transmission: '', seats: '', has_gps: false,
            has_air_conditioning: false, start_date: '', end_date: '', page: 1
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-black text-indigo-600 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span>🚗</span> CarRent
                    </h1>
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/wizard')} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-100 active:scale-95">
                            Pomoc w wyborze
                        </button>
                        <button onClick={() => navigate('/login')} className="bg-gray-900 text-white px-5 py-2 rounded-full font-bold hover:bg-gray-800 transition">
                            Strefa Klienta
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">

                <div className="lg:w-1/4 p-6 overflow-y-auto bg-gray-50 border-r border-gray-200 scrollbar-hide">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Filtry</h2>
                            <button onClick={resetFilters} className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">Reset</button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Od</label>
                                    <input type="date" value={filters.start_date} onChange={(e) => setFilters({...filters, start_date: e.target.value, page: 1})} className="w-full p-2 bg-gray-50 rounded-lg text-xs border border-gray-100 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Do</label>
                                    <input type="date" value={filters.end_date} onChange={(e) => setFilters({...filters, end_date: e.target.value, page: 1})} className="w-full p-2 bg-gray-50 rounded-lg text-xs border border-gray-100 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Szukaj modelu</label>
                                <input type="text" placeholder="np. BMW M4..." className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-indigo-500 outline-none transition text-sm" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})} />
                            </div>

                <div className="lg:w-1/4 p-6 overflow-y-auto bg-gray-50 border-r border-gray-200 z-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-0">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight">Filtruj ofertę</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Punkt odbioru</label>
                                <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none text-sm font-medium" value={filters.rental_point_id} onChange={(e) => setFilters({...filters, rental_point_id: e.target.value, page: 1})}>
                                    <option value="">Wszystkie lokalizacje</option>
                                    {rentalPoints.map(p => <option key={p.id} value={p.id}>{p.city} - {p.name}</option>)}
                                </select>
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
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cena max/doba</label>
                                    <span className="text-indigo-600 font-bold text-xs">{filters.max_price} PLN</span>
                                </div>
                                <input type="range" min="50" max="2000" step="50" value={filters.max_price} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" onChange={(e) => setFilters({...filters, max_price: e.target.value, page: 1})} />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nadwozie</label>
                                <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none text-sm" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value, page: 1})}>
                                    <option value="">Wszystkie typy</option>
                                    <option value="sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="hatchback">Hatchback</option>
                                    <option value="van">Van / Bus</option>
                                    <option value="coupe">Coupe</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Skrzynia</label>
                                <div className="flex gap-2">
                                    {['manual', 'automatic'].map(t => (
                                        <button key={t} onClick={() => setFilters({...filters, transmission: filters.transmission === t ? '' : t, page: 1})}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${filters.transmission === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}>
                                            {t === 'manual' ? 'Manual' : 'Automat'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={filters.has_gps} onChange={(e) => setFilters({...filters, has_gps: e.target.checked, page: 1})} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition" />
                                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-indigo-600 transition uppercase tracking-tight">System GPS</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" checked={filters.has_air_conditioning} onChange={(e) => setFilters({...filters, has_air_conditioning: e.target.checked, page: 1})} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition" />
                                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-indigo-600 transition uppercase tracking-tight">Klimatyzacja</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-3/4 p-8 overflow-y-auto bg-white">
                    {loading ? (
                         <div className="flex flex-col items-center justify-center h-64">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                             <p className="text-gray-400 italic text-sm">Przeszukujemy naszą flotę...</p>
                             <p className="text-gray-400 italic">Wyszukiwanie idealnego auta...</p>
                         </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {carsData.data.length > 0 ? carsData.data.map(car => (
                                    <div key={car.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">

                                        <div className="h-52 bg-gray-50 relative overflow-hidden">
                                {carsData.data.map(car => (
                                    <div key={car.id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                                            {car.image_path ? (
                                                <img src={STORAGE_URL + car.image_path} alt={car.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🚗</div>
                                            )}

                                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-gray-800 uppercase shadow-sm">{car.type}</span>
                                                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-gray-800 uppercase shadow-sm">{car.transmission === 'automatic' ? 'Automat' : 'Manual'}</span>
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
                                                <div className="absolute bottom-4 left-4 bg-indigo-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-2xl text-[9px] font-black shadow-lg uppercase tracking-widest">
                                                    📍 {car.rental_point.city}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-7 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900 leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tighter">{car.brand}</h3>
                                                    <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">{car.model}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-gray-900 leading-none tracking-tighter">{car.price_per_day}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">PLN / doba</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 py-5 border-y border-gray-50 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-gray-100 p-2 rounded-xl text-xs">⛽</span>
                                                    <span className="text-[10px] font-black text-gray-600 uppercase">{car.fuel_type}</span>
                                                </div>
                                                <div className="flex items-center gap-3 justify-end">
                                                    <span className="text-[10px] font-black text-gray-600 uppercase">{car.seats} miejsc</span>
                                                    <span className="bg-gray-100 p-2 rounded-xl text-xs">👥</span>
                                                </div>
                                            </div>

                                            <button onClick={() => navigate(`/car/${car.id}`)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 hover:shadow-indigo-100 active:scale-95">
                                                Szczegóły i Rezerwacja
                                            </button>
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
                                                className={`mt-3 w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    compareList.find(c => c.id === car.id)
                                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-100"
                                                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                                }`}
                                            >
                                                {compareList.find(c => c.id === car.id) ? "✓ Dodano do porównania" : "+ Porównaj Model"}
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
                                )) : (
                                    <div className="col-span-full text-center py-20">
                                        <p className="text-4xl mb-4">📭</p>
                                        <h3 className="text-xl font-black text-gray-800 uppercase">Nie znaleźliśmy aut</h3>
                                        <p className="text-gray-400 mt-2">Spróbuj zmienić filtry wyszukiwania.</p>
                                    </div>
                                )}
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
                                                link.active ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-100'
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

            {compareList.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-md text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-8 z-[100] border border-white/10 animate-in slide-in-from-bottom-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Porównywarka</span>
                        <span className="text-xs font-bold">{compareList.length} z 3 modeli wybranych</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10"></div>
                    <div className="flex gap-4">
                        <button onClick={() => setCompareList([])} className="text-xs font-bold text-gray-400 hover:text-white transition">Wyczyść</button>
                        <button
                            onClick={() => navigate('/compare', { state: { cars: compareList } })}
                            className="bg-indigo-600 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition active:scale-95"
                        >
                            Porównaj Teraz &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarListing;
