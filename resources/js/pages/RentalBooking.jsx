import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RentalBooking = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const STORAGE_URL = 'http://localhost:8000/storage/';

    const [car, setCar] = useState(null);
    const [points, setPoints] = useState([]);
    const [rentalStats, setRentalStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    const [formData, setFormData] = useState({
        rental_point_end_id: '',
        start_date: '',
        planned_end_date: '',
        notes: '',
        use_extra_insurance: location.state?.extraInsurance || false
    });

    const [endPointSearch, setEndPointSearch] = useState('');
    const [showEndPointDropdown, setShowEndPointDropdown] = useState(false);
    const [priceCalculation, setPriceCalculation] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.rental_point_end_id && formData.start_date && formData.planned_end_date && car) {
            calculatePrice();
        }
    }, [formData.rental_point_end_id, formData.start_date, formData.planned_end_date, formData.use_extra_insurance]);

    const fetchData = async () => {
        try {
            const [carRes, pointsRes, statsRes] = await Promise.all([
                axios.get(`http://localhost:8000/api/cars/${carId}`),
                axios.get('http://localhost:8000/api/rental-points'),
                axios.get('http://localhost:8000/api/user/rental-stats', config)
            ]);

            setCar(carRes.data);
            setPoints(pointsRes.data);
            setRentalStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const calculatePrice = async () => {
        setCalculating(true);
        try {
            const res = await axios.post('http://localhost:8000/api/user/calculate-price', {
                car_id: carId,
                rental_point_start_id: car.rental_point_id,
                rental_point_end_id: formData.rental_point_end_id,
                start_date: formData.start_date,
                planned_end_date: formData.planned_end_date,
                use_extra_insurance: formData.use_extra_insurance
            }, config);

            setPriceCalculation(res.data);
            setCalculating(false);
        } catch (error) {
            console.error('Calculation error:', error);
            setCalculating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/user/rentals', {
                ...formData,
                car_id: carId,
                rental_point_start_id: car.rental_point_id,
            }, config);

            alert('Rezerwacja utworzona pomyślnie!');
            navigate('/user/rentals');
        } catch (error) {
            alert(error.response?.data?.message || 'Błąd rezerwacji');
        }
    };

    const handleEndPointSelect = (point) => {
        setFormData({...formData, rental_point_end_id: point.id});
        setEndPointSearch(point.name);
        setShowEndPointDropdown(false);
    };

    const filteredEndPoints = ((points?.data || points) || []).filter(point =>
        point.name?.toLowerCase().includes(endPointSearch.toLowerCase()) ||
        point.city?.toLowerCase().includes(endPointSearch.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!car) return <div className="text-center p-20 text-gray-500 dark:text-gray-300">Nie znaleziono samochodu</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
            <nav className="bg-white dark:bg-gray-900 shadow-sm p-4 sticky top-0 z-50 border-b border-transparent dark:border-gray-800">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <span>🚗</span> CarRent
                    </h1>
                    <button onClick={() => navigate(`/car/${carId}`)} className="text-gray-600 dark:text-gray-300 font-bold hover:text-indigo-600 transition">
                        &larr; Wróć do szczegółów
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 lg:p-12">
                {rentalStats && rentalStats.rentals_until_discount === 0 && (
                    <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-3xl shadow-lg">
                        <p className="text-sm font-bold uppercase tracking-widest mb-1">Gratulacje!</p>
                        <p className="text-2xl font-black">To Twoje {rentalStats.completed_rentals + 1}. wypożyczenie - {rentalStats.next_discount}% rabatu!</p>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-5/12">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
                            <div className="h-64 bg-gray-100 dark:bg-gray-700">
                                {car.image_path ? (
                                    <img src={STORAGE_URL + car.image_path} alt={car.model} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🚗</div>
                                )}
                            </div>

                            <div className="p-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{car.brand} {car.model}</h2>
                                <p className="text-gray-500 dark:text-gray-300 text-sm mb-4">{car.year} • {car.type}</p>

                                <div className="flex gap-2 mb-4">
                                    {car.has_gps && (
                                        <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">GPS</span>
                                    )}
                                    {car.has_air_conditioning && (
                                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">Klimatyzacja</span>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase">Cena za dzień</span>
                                        <span className="text-xl font-black text-gray-900 dark:text-white">{car.price_per_day} PLN</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase">Punkt odbioru</span>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{car.rental_point?.city}</span>
                                    </div>
                                </div>

                                {rentalStats && (
                                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                                        <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Twoje wypożyczenia</p>
                                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-300">{rentalStats.completed_rentals}</p>
                                        {rentalStats.rentals_until_discount > 0 && (
                                            <p className="text-xs text-indigo-500 dark:text-indigo-300 mt-2">
                                                Za {rentalStats.rentals_until_discount + 1} wypożyczeń: {rentalStats.next_discount}% rabatu
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-7/12">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Formularz rezerwacji</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-300 uppercase mb-2">Punkt zwrotu</label>
                                    <input
                                        type="text"
                                        value={endPointSearch}
                                        onChange={e => {
                                            setEndPointSearch(e.target.value);
                                            setShowEndPointDropdown(true);
                                            if (!e.target.value) setFormData({...formData, rental_point_end_id: ''});
                                        }}
                                        onFocus={() => setShowEndPointDropdown(true)}
                                        placeholder="Wybierz punkt zwrotu..."
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        required={!formData.rental_point_end_id}
                                    />
                                    {showEndPointDropdown && filteredEndPoints.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                            {filteredEndPoints.map(point => (
                                                <div
                                                    key={point.id}
                                                    onClick={() => handleEndPointSelect(point)}
                                                    className="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                                >
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{point.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{point.city}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-300 uppercase mb-2">Data odbioru</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.start_date}
                                            onChange={e => setFormData({...formData, start_date: e.target.value})}
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 dark:text-gray-300 uppercase mb-2">Data zwrotu</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.planned_end_date}
                                            onChange={e => setFormData({...formData, planned_end_date: e.target.value})}
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div
                                    onClick={() => setFormData({...formData, use_extra_insurance: !formData.use_extra_insurance})}
                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                        formData.use_extra_insurance 
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-inner' 
                                        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-indigo-100 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{formData.use_extra_insurance ? '💎' : '🛡️'}</span>
                                        <div>
                                            <p className="font-black text-gray-800 dark:text-gray-200 uppercase text-xs tracking-widest">Ubezpieczenie AC Premium</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">Ochrona przed kradzieżą i uszkodzeniami</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.use_extra_insurance ? 'bg-emerald-500 border-emerald-500 shadow-md' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {formData.use_extra_insurance && <span className="text-white text-[10px]">✓</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-300 uppercase mb-2">Uwagi (opcjonalne)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({...formData, notes: e.target.value})}
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                        rows="3"
                                        placeholder="Dodatkowe informacje..."
                                    />
                                </div>

                                {priceCalculation && (
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase mb-4">Podsumowanie kosztów</p>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-300">Czas najmu ({priceCalculation.days} dni)</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{priceCalculation.base_price} PLN</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-300">Ubezpieczenie</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{priceCalculation.insurance_price} PLN</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-300">Dystans ({priceCalculation.distance_km} km)</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{priceCalculation.distance_fee} PLN</span>
                                            </div>

                                            {/* ZACHOWANE Z DRUGIEJ GAŁĘZI: Wyświetlanie rabatu jeśli istnieje */}
                                            {parseFloat(priceCalculation.discount_amount) > 0 && (
                                                <div className="flex justify-between text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                                    <span className="flex items-center gap-1.5">🎁 Rabat lojalnościowy</span>
                                                    <span>-{priceCalculation.discount_amount} PLN</span>
                                                </div>
                                            )}

                                            <div className="pt-3 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
                                                <span className="text-gray-900 dark:text-white font-black uppercase text-sm">Razem</span>
                                                <span className="text-3xl font-black text-indigo-600">{priceCalculation.total_price} PLN</span>
                                            </div>

                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500 dark:text-gray-300">Twoje saldo</span>
                                                    <span className={`font-bold ${priceCalculation.has_enough_balance ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {priceCalculation.user_balance} PLN
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!priceCalculation || !priceCalculation.has_enough_balance || calculating}
                                    className="w-full py-6 rounded-3xl bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-30"
                                >
                                    {calculating ? 'Przeliczam dane...' : 'Potwierdź rezerwację'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RentalBooking;