import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CarComparison = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const cars = location.state?.cars || [];
    const STORAGE_URL = 'http://localhost:8000/storage/';

    if (cars.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10">
                <p className="text-gray-400 italic mb-4">Nie wybrano samochodów do porównania.</p>
                <button onClick={() => navigate('/cars')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest">Wróć do listy</button>
            </div>
        );
    }

    const getBestValue = (attr, type = 'max') => {
        const values = cars.map(c => parseFloat(c[attr]) || 0);
        return type === 'max' ? Math.max(...values) : Math.min(...values);
    };

    const renderFeatureIcon = (exists) => (
        exists
            ? <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">✓ Tak</span>
            : <span className="text-red-400 font-black text-xs uppercase tracking-widest opacity-50">✕ Nie</span>
    );

    const renderRow = (label, attr, type = 'max', suffix = "") => {
        const bestVal = getBestValue(attr, type);
        return (
            <tr className="border-b border-gray-100 group">
                <td className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30 w-1/4">
                    {label}
                </td>
                {cars.map(car => {
                    const currentVal = parseFloat(car[attr]) || 0;
                    const isBest = currentVal === bestVal && currentVal !== 0;
                    return (
                        <td key={car.id} className={`py-6 px-6 text-center transition-all ${isBest ? 'bg-emerald-50/40' : ''}`}>
                            <span className={`text-sm font-bold ${isBest ? 'text-emerald-600 scale-110 block transform' : 'text-gray-700'}`}>
                                {car[attr]}{suffix} {isBest && "★"}
                            </span>
                        </td>
                    );
                })}
            </tr>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-gray-900">
                            Porównanie <span className="text-indigo-600">Modeli</span>
                        </h1>
                        <p className="text-gray-400 font-medium mt-2 italic">Zestawienie parametrów technicznych i kosztów</p>
                    </div>
                    <button onClick={() => navigate('/cars')} className="bg-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-sm border border-gray-200 hover:bg-gray-50 transition">
                        &larr; Powrót do listy samochodów
                    </button>
                </header>

                <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white">
                                <th className="p-8 w-1/4 italic text-gray-300 font-medium border-b border-gray-100">Cecha pojazdu</th>
                                {cars.map(car => (
                                    <th
                                        key={car.id}
                                        className="p-8 text-center min-w-[250px] cursor-pointer hover:bg-gray-50/50 transition-colors border-b border-gray-100 group"
                                        onClick={() => navigate(`/car/${car.id}`)}
                                    >
                                        <div className="h-40 w-full rounded-[2.5rem] overflow-hidden mb-6 shadow-inner bg-gray-100 border border-gray-50 relative">
                                            {car.image_path ? (
                                                <img src={STORAGE_URL + car.image_path} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={car.model} />
                                            ) : <div className="h-full flex items-center justify-center text-5xl">🚗</div>}

                                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="bg-white text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Zobacz szczegóły</span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 leading-none tracking-tighter uppercase group-hover:text-indigo-600 transition-colors">{car.brand}</h3>
                                        <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mt-2">{car.model}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>

                            <tr className="bg-gray-50/50"><td colSpan={cars.length + 1} className="py-2 px-6 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Koszty i Ubezpieczenie</td></tr>
                            {renderRow("Cena za dobę", "price_per_day", 'min', " PLN")}
                            {renderRow("Ubezpieczenie/doba", "insurance_per_day", 'min', " PLN")}

                            <tr className="bg-gray-50/50"><td colSpan={cars.length + 1} className="py-2 px-6 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Specyfikacja techniczna</td></tr>
                            {renderRow("Rok produkcji", "year", 'max')}
                            {renderRow("Liczba miejsc", "seats", 'max', " os.")}

                            <tr className="border-b border-gray-100">
                                <td className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Typ nadwozia</td>
                                {cars.map(car => <td key={car.id} className="py-6 px-6 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">{car.type}</td>)}
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Rodzaj paliwa</td>
                                {cars.map(car => <td key={car.id} className="py-6 px-6 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">{car.fuel_type}</td>)}
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Skrzynia biegów</td>
                                {cars.map(car => <td key={car.id} className="py-6 px-6 text-center font-bold text-gray-700 uppercase text-xs tracking-wider">{car.transmission}</td>)}
                            </tr>

                            <tr className="bg-gray-50/50"><td colSpan={cars.length + 1} className="py-2 px-6 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Wyposażenie dodatkowe</td></tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Nawigacja GPS</td>
                                {cars.map(car => (
                                    <td key={car.id} className={`py-6 px-6 text-center ${car.has_gps ? 'bg-emerald-50/40' : ''}`}>
                                        {renderFeatureIcon(car.has_gps)}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Klimatyzacja</td>
                                {cars.map(car => (
                                    <td key={car.id} className={`py-6 px-6 text-center ${car.has_air_conditioning ? 'bg-emerald-50/40' : ''}`}>
                                        {renderFeatureIcon(car.has_air_conditioning)}
                                    </td>
                                ))}
                            </tr>

                            <tr className="bg-gray-50/50"><td colSpan={cars.length + 1} className="py-2 px-6 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Lokalizacja i Inne</td></tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Punkt Odbioru</td>
                                {cars.map(car => (
                                    <td key={car.id} className="py-6 px-6 text-center font-bold text-indigo-600 text-xs uppercase">
                                        {car.rental_point ? `${car.rental_point.name} (${car.rental_point.city})` : "Magazyn"}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Opis</td>
                                {cars.map(car => (
                                    <td key={car.id} className="py-6 px-6 text-center text-[10px] text-gray-400 italic max-w-[200px]">
                                        {car.description ? car.description.substring(0, 50) + "..." : "Brak opisu"}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-full shadow-sm border border-gray-100">
                        <span className="text-emerald-500 font-black">★</span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Automatyczne podświetlenie najlepszej oferty w danej kategorii
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarComparison;
