import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);

    // NOWE: Stan dla dodatkowego ubezpieczenia
    const [wantsExtraInsurance, setWantsExtraInsurance] = useState(false);

    // Sprawdzamy stan zalogowania na podstawie tokena
    const isLoggedIn = !!localStorage.getItem('token');

    const STORAGE_URL = 'http://localhost:8000/storage/';

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/cars/${id}`);
                setCar(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Błąd pobierania szczegółów auta", err);
                setLoading(false);
            }
        };
        fetchCarDetails();
    }, [id]);

    // --- LOGIKA WYLICZANIA STAWKI DODATKOWEGO AC (ZGODNA Z MODELEM) ---
    const calculateExtraInsurance = () => {
        if (!car) return 0;
        const base = parseFloat(car.price_per_day);
        let multiplier = 1.0;
        const typeMultipliers = { 'SUV': 1.4, 'van': 1.3, 'coupe': 1.8, 'electric': 1.5, 'sedan': 1.0, 'hatchback': 0.9 };
        multiplier *= (typeMultipliers[car.type] || 1.0);
        const premiumBrands = ['BMW', 'Mercedes', 'Audi', 'Tesla', 'Porsche'];
        if (premiumBrands.includes(car.brand)) multiplier *= 1.3;
        const age = new Date().getFullYear() - car.year;
        if (age <= 2) multiplier *= 1.25;
        return Math.round((base * 0.12) * multiplier);
    };

    const dailyPrice = car ? parseFloat(car.price_per_day) : 0;
    const standardInsurance = car ? parseFloat(car.insurance_per_day) : 0;
    const extraInsurancePrice = calculateExtraInsurance();

    // LOGIKA: AC zastępuje Standard. Suma do wyświetlenia na górze panelu.
    const finalDailyPrice = wantsExtraInsurance
        ? dailyPrice + extraInsurancePrice
        : dailyPrice + standardInsurance;

    const handleBookingClick = () => {
        if (!isLoggedIn) {
            navigate('/login');
        } else {
            // Przekazujemy wybór ubezpieczenia do ekranu rezerwacji
            navigate(`/rental/${id}`, { state: { extraInsurance: wantsExtraInsurance } });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!car) return <div className="text-center p-20 text-gray-500 italic">Nie znaleziono pojazdu.</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nawigacja */}
            <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span>🚗</span> CarRent
                    </h1>
                    <button onClick={() => navigate('/cars')} className="text-gray-600 font-bold hover:text-indigo-600 transition">
                        &larr; Powrót do listy
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 lg:p-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    <div className="lg:w-2/3">
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white h-[400px] lg:h-[500px] group">
                            {car.image_path ? (
                                <img src={STORAGE_URL + car.image_path} alt={car.brand} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-6xl italic opacity-20">🚗</div>
                            )}

                            <div className="absolute top-6 left-6 flex gap-2">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                    {car.type}
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                    {car.year}
                                </div>
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-gray-800 shadow-sm uppercase tracking-tighter">
                                    {car.seats} os.
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Specyfikacja techniczna</h2>
                            <h1 className="text-4xl font-black text-gray-900 mb-6">{car.brand} <span className="text-indigo-600">{car.model}</span></h1>

                            <p className="text-gray-600 leading-relaxed text-lg mb-8 italic">
                                {car.description || "Brak dodatkowego opisu dla tego pojazdu. Zapraszamy do kontaktu z punktem odbioru w celu uzyskania szczegółowych informacji."}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Paliwo</p>
                                    <p className="font-bold text-gray-800 uppercase text-sm">{car.fuel_type}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Skrzynia</p>
                                    <p className="font-bold text-gray-800 uppercase text-sm">{car.transmission}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">GPS</p>
                                    <p className="font-bold text-gray-800 text-sm">{car.has_gps ? 'TAK' : 'NIE'}</p>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Klimatyzacja</p>
                                    <p className="font-bold text-gray-800 text-sm">{car.has_air_conditioning ? 'TAK' : 'NIE'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 sticky top-28 transition-all">
                            <div className="mb-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Łączna cena za dobę</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-gray-900 tracking-tighter">{finalDailyPrice}</span>
                                    <span className="text-indigo-600 font-bold text-lg">PLN / doba</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Punkt odbioru</p>
                                    <p className="font-bold text-gray-800 text-sm">
                                        📍 {car.rental_point ? `${car.rental_point.name}, ${car.rental_point.city}` : "Magazyn centralny"}
                                    </p>
                                </div>

                                {/* UBEZPIECZENIE PODSTAWOWE - Wliczone domyślnie */}
                                <div className={`p-5 rounded-[2rem] border transition-all flex items-center justify-between ${!wantsExtraInsurance ? 'bg-emerald-50 border-emerald-100 opacity-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-xs">🛡️</div>
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Ochrona Standard</p>
                                            <p className="font-bold text-emerald-700 text-[10px] italic">Wliczone OC/NW</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-emerald-600">+{standardInsurance} PLN</p>
                                </div>

                                {/* UBEZPIECZENIE DODATKOWE - AC Premium (Zastępuje Standard po kliknięciu) */}
                                <div
                                    onClick={() => setWantsExtraInsurance(!wantsExtraInsurance)}
                                    className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-3 ${
                                        wantsExtraInsurance
                                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                        : 'border-gray-100 bg-white hover:border-indigo-100'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${wantsExtraInsurance ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                                        💎
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-[9px] font-black uppercase tracking-widest font-bold ${wantsExtraInsurance ? 'text-indigo-600' : 'text-gray-400'}`}>Pełna ochrona AC</p>
                                        <p className="font-bold text-gray-800 text-xs">+{extraInsurancePrice} PLN <span className="text-[8px] font-normal italic">(zamiast Standard)</span></p>
                                    </div>
                                    {wantsExtraInsurance && <span className="text-indigo-500 font-bold text-xs">✓</span>}
                                </div>
                            </div>

                            <button
                                onClick={handleBookingClick}
                                className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                                     "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                                }`}
                            >
                                {isLoggedIn ? "Zarezerwuj" : "Zaloguj się, aby zarezerwować"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CarDetails;
