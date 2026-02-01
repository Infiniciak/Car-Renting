import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPromoCodes = () => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: 100,
        expires_at: '',
        description: ''
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/admin/promo-codes', config);
            setCodes(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching codes:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/admin/promo-codes', formData, config);
            setIsModalOpen(false);
            setFormData({ amount: 100, expires_at: '', description: '' });
            fetchCodes();
        } catch (error) {
            alert(error.response?.data?.message || 'Błąd generowania kodu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Usunąć ten kod?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/admin/promo-codes/${id}`, config);
            fetchCodes();
        } catch (error) {
            alert(error.response?.data?.message || 'Błąd usuwania');
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Skopiowano: ${code}`);
    };

    const getStatusBadge = (code) => {
        if (code.used) {
            return <span className="text-xs px-3 py-1 rounded-full font-bold bg-gray-400 text-white">Wykorzystany</span>;
        }
        if (code.expires_at && new Date(code.expires_at) < new Date()) {
            return <span className="text-xs px-3 py-1 rounded-full font-bold bg-red-400 text-white">Wygasły</span>;
        }
        return <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-500 text-white">Aktywny</span>;
    };

    if (loading) return (
        <div className="min-h-screen bg-[#11111d] flex items-center justify-center text-white">
            Ładowanie...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#11111d] p-8 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Kody Doładowania</h1>
                        <p className="text-indigo-400 font-medium">Generuj i zarządzaj kodami</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-4 rounded-2xl font-black transition-all"
                    >
                        + GENERUJ KOD
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {codes.length === 0 ? (
                        <div className="bg-[#1e1e2d] p-12 rounded-[2rem] border border-white/5 text-center text-gray-400">
                            Brak kodów doładowania
                        </div>
                    ) : (
                        codes.map(code => (
                            <div key={code.id} className="bg-[#1e1e2d] p-6 rounded-[2rem] border border-white/5">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <button
                                                onClick={() => copyToClipboard(code.code)}
                                                className="text-2xl font-black text-indigo-400 hover:text-indigo-300 transition font-mono"
                                            >
                                                {code.code}
                                            </button>
                                            {getStatusBadge(code)}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Kwota</p>
                                                <p className="text-emerald-400 text-xl font-black">{code.amount} PLN</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Status</p>
                                                <p className="text-gray-300 font-bold">{code.used ? 'Wykorzystany' : 'Dostępny'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Utworzony</p>
                                                <p className="text-gray-300">{new Date(code.created_at).toLocaleDateString('pl-PL')}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase font-bold mb-1">Wygasa</p>
                                                <p className="text-gray-300">
                                                    {code.expires_at ? new Date(code.expires_at).toLocaleDateString('pl-PL') : 'Nigdy'}
                                                </p>
                                            </div>
                                        </div>

                                        {code.description && (
                                            <div className="mt-4 p-3 bg-[#11111d] rounded-xl">
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Opis</p>
                                                <p className="text-sm text-gray-300">{code.description}</p>
                                            </div>
                                        )}

                                        {code.used && code.used_by_user && (
                                            <div className="mt-4 p-3 bg-[#11111d] rounded-xl">
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Użyty przez</p>
                                                <p className="text-sm text-gray-300">
                                                    {code.used_by_user.name} - {new Date(code.used_at).toLocaleString('pl-PL')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {!code.used && (
                                        <button
                                            onClick={() => handleDelete(code.id)}
                                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-sm ml-4"
                                        >
                                            Usuń
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-[#1e1e2d] p-10 rounded-[3rem] border border-white/10 max-w-md w-full">
                            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Generuj Kod</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Kwota (PLN)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                        className="w-full p-4 bg-[#11111d] rounded-2xl border-none text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        min="1"
                                        max="10000"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Opis (opcjonalnie)</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        className="w-full p-4 bg-[#11111d] rounded-2xl border-none text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="np. Bonus dla nowego klienta"
                                        maxLength="255"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Data wygaśnięcia (opcjonalnie)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={e => setFormData({...formData, expires_at: e.target.value})}
                                        className="w-full p-4 bg-[#11111d] rounded-2xl border-none text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-2xl font-black uppercase"
                                    >
                                        Generuj
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold uppercase"
                                    >
                                        Anuluj
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromoCodes;
