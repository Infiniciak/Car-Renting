import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeePanel = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [promoInput, setPromoInput] = useState({});

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        registration_number: '',
        price_per_day: ''
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/employee/cars', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Błąd pobierania aut:", error);
            if (error.response && error.response.status === 403) {
                alert("Nie jesteś przypisany do żadnego punktu!");
            }
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/employee/cars', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Dodano pojazd!");
            setFormData({ brand: '', model: '', registration_number: '', price_per_day: '' });
            fetchCars();
        } catch (error) {
            console.error(error);
           if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                if (status === 403) {
                    alert("Twoje konto nie jest przypisane do żadnego punktu wypożyczeń. Skontaktuj się z Administratorem.");
                } else if (status === 422) {
                    let errorMsg = "Błąd danych:\n";
                    if (data.errors) {
                        Object.values(data.errors).forEach(err => {
                            errorMsg += `- ${err}\n`;
                        });
                    } else {
                        errorMsg += data.message;
                    }
                    alert(errorMsg);
                } else {
                    alert("Wystąpił błąd serwera: " + (data.message || status));
                }
            } else {
                alert("Błąd połączenia z serwerem. Sprawdź czy Laravel działa.");
            }
        }
    };

    const changeStatus = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:8000/api/employee/cars/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCars();
        } catch (error) {
            alert("Nie udało się zmienić statusu.");
        }
    };


    const handlePromoSubmit = async (id) => {
        const price = promoInput[id];
        if (!price) return;

        try {
            await axios.patch(`http://localhost:8000/api/employee/cars/${id}/promotion`,
                { promotion_price: price },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Promocja zaktualizowana!");
            setPromoInput({ ...promoInput, [id]: '' });
            fetchCars();
        } catch (error) {
            alert(error.response?.data?.message || "Błąd promocji");
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Usunąć ten pojazd?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/employee/cars/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCars();
        } catch (error) {
            alert("Błąd usuwania");
        }
    };


    const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    // Dodajemy losowy numer na końcu, żeby przeglądarka "myślała", że to nowa strona
    const cacheBuster = Math.random().toString(36).substring(7);
    window.location.href = `/login?v=${cacheBuster}`;
};


    const getStatusBadge = (status) => {
        switch(status) {
            case 'available': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Dostępny</span>;
            case 'rented': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">Wynajęty</span>;
            case 'maintenance': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">W SERWISIE</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8 font-sans text-gray-100">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">

                {/* NAGŁÓWEK */}
                <div className="bg-blue-600 px-8 py-4 flex justify-between items-center text-white shadow-md">
                    <h2 className="text-xl font-bold tracking-wide">Panel Pracownika</h2>

                    <div className="flex items-center gap-4">
                        {/* PRZYCISK PROFILU */}
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 bg-blue-700/50 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                        >
                            ⚙️ Mój Profil
                        </Link>

                        <button onClick={handleLogout} className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-700 transition shadow-lg">
                            Wyloguj
                        </button>
                    </div>
                </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formularz dodawania */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
                        <h2 className="text-xl font-bold mb-4">Dodaj Pojazd</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input className="w-full p-3 border rounded" placeholder="Marka" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                            <input className="w-full p-3 border rounded" placeholder="Model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                            <input className="w-full p-3 border rounded" placeholder="Rejestracja" value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} required />
                            <input className="w-full p-3 border rounded" type="number" placeholder="Cena (PLN)" value={formData.price_per_day} onChange={e => setFormData({...formData, price_per_day: e.target.value})} required />
                            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded font-bold">Dodaj</button>
                        </form>
                    </div>

                   {/* Lista Samochodów */}
                    <div className="lg:col-span-2 space-y-4">
                        {cars.map(car => (
                            <div key={car.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">

                                {/* Informacje o aucie */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold">{car.brand} {car.model}</h3>
                                        {getStatusBadge(car.status)}
                                    </div>
                                    <p className="text-gray-500 font-mono text-sm mb-2">{car.registration_number}</p>

                                    {/* Cena z przekreśleniem jeśli jest promocja */}
                                    <div className="text-lg">
                                        {car.promotion_price ? (
                                            <>
                                                <span className="line-through text-gray-400 mr-2">{car.price_per_day} zł</span>
                                                <span className="text-red-600 font-black">{car.promotion_price} zł / doba 🔥</span>
                                            </>
                                        ) : (
                                            <span className="font-bold text-gray-800">{car.price_per_day} zł / doba</span>
                                        )}
                                    </div>

                                    {/* Sekcja ustawiania promocji */}
                                    <div className="mt-4 flex gap-2 items-center">
                                        <input
                                            type="number"
                                            placeholder="Nowa cena..."
                                            className="w-32 p-1 border rounded text-sm"
                                            value={promoInput[car.id] || ''}
                                            onChange={(e) => setPromoInput({...promoInput, [car.id]: e.target.value})}
                                        />
                                        <button onClick={() => handlePromoSubmit(car.id)} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1.5 rounded font-bold border border-indigo-100">
                                            {car.promotion_price ? 'Zmień Promo' : 'Ustaw Promo'}
                                        </button>
                                        {car.promotion_price && (
                                            <button onClick={() => { setPromoInput({...promoInput, [car.id]: 0}); handlePromoSubmit(car.id); }} className="text-xs text-red-500 underline ml-2">
                                                Zakończ
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Przyciski Akcji */}
                                <div className="flex flex-col gap-2 justify-center min-w-[160px]">
                                    {car.status === 'available' && (
                                        <>
                                            <button onClick={() => changeStatus(car.id, 'rented')} className="bg-blue-600 text-white py-2 rounded font-bold text-sm hover:bg-blue-700">
                                                Wypożycz Klientowi
                                            </button>
                                            <button onClick={() => changeStatus(car.id, 'maintenance')} className="bg-gray-100 text-gray-600 py-2 rounded font-bold text-sm border hover:bg-gray-200">
                                                🔧 Wyślij na Serwis
                                            </button>
                                        </>
                                    )}

                                    {car.status === 'rented' && (
                                        <button onClick={() => changeStatus(car.id, 'available')} className="bg-green-500 text-white py-2 rounded font-bold text-sm hover:bg-green-600">
                                            Odbierz od Klienta
                                        </button>
                                    )}

                                    {car.status === 'maintenance' && (
                                        <button onClick={() => changeStatus(car.id, 'available')} className="bg-green-500 text-white py-2 rounded font-bold text-sm hover:bg-green-600">
                                            ✅ Przywróć z Serwisu
                                        </button>
                                    )}

                                    <button onClick={() => handleDelete(car.id)} className="mt-2 text-red-400 text-xs hover:text-red-600 hover:underline text-center">
                                        Kasacja Pojazdu
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeePanel;
