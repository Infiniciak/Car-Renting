import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from 'recharts';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('vehicles');
    const [vehicleStats, setVehicleStats] = useState(null);
    const [revenueStats, setRevenueStats] = useState(null);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#fbbf24', '#10b981'];

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchVehicleStats();
        fetchRevenueStats();
    }, []);

    const fetchVehicleStats = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/admin/stats', config);
            setVehicleStats(res.data);
        } catch (err) {
            console.error("Błąd statystyk pojazdów", err);
        }
    };

    const fetchRevenueStats = async () => {
        try {
            const [statsRes, monthlyRes, pointsRes, usersRes, discountsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/revenue-stats', config),
                axios.get('http://localhost:8000/api/admin/revenue-by-month', config),
                axios.get('http://localhost:8000/api/admin/revenue-by-point', config),
                axios.get('http://localhost:8000/api/admin/top-users', config),
                axios.get('http://localhost:8000/api/admin/discount-stats', config),
            ]);

            setRevenueStats({
                general: statsRes.data,
                monthly: monthlyRes.data,
                byPoint: pointsRes.data,
                topUsers: usersRes.data,
                discounts: discountsRes.data,
            });
        } catch (err) {
            console.error("Błąd statystyk przychodów", err);
        }
    };

    if (!vehicleStats || !revenueStats) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-400 font-black tracking-widest uppercase text-xs">Ładowanie danych...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-white font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Dashboard</h1>
                        <p className="text-indigo-400 font-medium mt-2 italic">Panel statystyk</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Ostatnia aktualizacja</p>
                        <p className="text-xs font-bold text-gray-400">{new Date().toLocaleString()}</p>
                    </div>
                </header>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('vehicles')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tight text-sm transition-all ${
                            activeTab === 'vehicles'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        Pojazdy
                    </button>
                    <button
                        onClick={() => setActiveTab('revenue')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-tight text-sm transition-all ${
                            activeTab === 'revenue'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        Przychody
                    </button>
                </div>

                {activeTab === 'vehicles' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Wszystkie Auta', val: vehicleStats.general.total_cars, color: 'text-indigo-400', sub: 'Liczba pojazdów' },
                                { label: 'Dostępne', val: vehicleStats.general.available_cars, color: 'text-emerald-400', sub: 'Gotowe do wynajmu' },
                                { label: 'Średni Rocznik', val: vehicleStats.general.avg_year, color: 'text-blue-400'},
                                { label: 'Przychód / Doba', val: `${vehicleStats.general.total_value} PLN`, color: 'text-rose-400', sub: 'Maks. potencjał' }
                            ].map((kpi, i) => (
                                <div key={i} className="bg-[#1e1e2d] p-7 rounded-[2.5rem] border border-white/5 shadow-2xl group transition-all hover:bg-[#252538]">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                                    <p className={`text-3xl font-black ${kpi.color} tracking-tighter`}>{kpi.val}</p>
                                    <div className="h-1 w-8 bg-white/5 mt-3 group-hover:w-full transition-all duration-500"></div>
                                    <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase">{kpi.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl h-[450px]">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400 border-l-4 border-indigo-500 pl-4">Typy Nadwozia</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <PieChart>
                                        <Pie
                                            data={vehicleStats.by_type}
                                            dataKey="total"
                                            nameKey="type"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                        >
                                            {vehicleStats.by_type.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                                        </Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#11111d', border: 'none', borderRadius: '15px', fontSize: '12px'}} />
                                        <Legend iconType="circle" wrapperStyle={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl h-[450px]">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400 border-l-4 border-rose-500 pl-4">Ceny Średnie</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <AreaChart data={vehicleStats.avg_prices}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="type" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{backgroundColor: '#11111d', border: 'none', borderRadius: '15px'}} />
                                        <Area type="monotone" dataKey="avg_price" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-200 dark:border-gray-700 shadow-xl h-[400px] transition-colors duration-300">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400 border-l-4 border-emerald-500 pl-4">Rodzaje Paliwa</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={vehicleStats.fuel_stats} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="fuel_type" type="category" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} width={80} />
                                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#11111d', border: 'none'}} />
                                        <Bar dataKey="total" fill="#10b981" radius={[0, 10, 10, 0]} barSize={15} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col transition-colors duration-300">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Pojazdy w miastach</h3>
                                <div className="space-y-3 overflow-y-auto pr-2">
                                    {vehicleStats.city_stats.map((city, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-[1.5rem] border border-gray-200 dark:border-gray-600 transition-hover hover:border-indigo-500/30">
                                            <span className="text-xs font-bold uppercase tracking-tight">{city.city}</span>
                                            <span className="text-indigo-400 font-black text-xs">{city.total} szt.</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'revenue' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Przychód Total', val: `${revenueStats.general.total_revenue} PLN`, color: 'text-emerald-400' },
                                { label: 'Przychód Netto', val: `${revenueStats.general.net_revenue} PLN`, color: 'text-blue-400' },
                                { label: 'Średnia Wartość', val: `${revenueStats.general.avg_rental_value} PLN`, color: 'text-indigo-400' },
                                { label: 'Aktywne Wynajmy', val: `${revenueStats.general.active_rentals_value} PLN`, color: 'text-yellow-400' }
                            ].map((kpi, i) => (
                                <div key={i} className="bg-[#1e1e2d] p-7 rounded-[2.5rem] border border-white/5 shadow-2xl group transition-all hover:bg-[#252538]">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                                    <p className={`text-3xl font-black ${kpi.color} tracking-tighter`}>{kpi.val}</p>
                                    <div className="h-1 w-8 bg-white/5 mt-3 group-hover:w-full transition-all duration-500"></div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-[#1e1e2d] p-6 rounded-[2.5rem] border border-white/5">
                                <p className="text-xs font-black uppercase text-gray-400 mb-2">Zakończone</p>
                                <p className="text-2xl font-black text-green-400">{revenueStats.general.completed_rentals}</p>
                            </div>
                            <div className="bg-[#1e1e2d] p-6 rounded-[2.5rem] border border-white/5">
                                <p className="text-xs font-black uppercase text-gray-400 mb-2">Anulowane</p>
                                <p className="text-2xl font-black text-red-400">{revenueStats.general.cancelled_rentals}</p>
                            </div>
                            <div className="bg-[#1e1e2d] p-6 rounded-[2.5rem] border border-white/5">
                                <p className="text-xs font-black uppercase text-gray-400 mb-2">Zwroty</p>
                                <p className="text-2xl font-black text-yellow-400">{revenueStats.general.total_refunds} PLN</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl h-[450px]">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400 border-l-4 border-emerald-500 pl-4">Przychód wg Miesięcy</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <AreaChart data={revenueStats.monthly}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="month" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{backgroundColor: '#11111d', border: 'none', borderRadius: '15px'}} />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl h-[450px]">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400 border-l-4 border-indigo-500 pl-4">Przychód wg Punktów</h3>
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={revenueStats.byPoint} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} width={100} />
                                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#11111d', border: 'none'}} />
                                        <Bar dataKey="revenue" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Top 10 Klientów</h3>
                                <div className="space-y-3 overflow-y-auto pr-2 max-h-[350px]">
                                    {revenueStats.topUsers.map((user, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded-[1.5rem] border border-white/5">
                                            <div>
                                                <p className="text-sm font-bold">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.rentals_count} wypożyczeń</p>
                                            </div>
                                            <span className="text-emerald-400 font-black text-sm">{user.total_spent} PLN</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Statystyki Rabatów</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-black/20 p-6 rounded-[2rem] border border-white/5">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Łączne Rabaty</p>
                                        <p className="text-3xl font-black text-yellow-400">{revenueStats.discounts.total_discounts_given} PLN</p>
                                    </div>
                                    <div className="bg-black/20 p-6 rounded-[2rem] border border-white/5">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Wynajmy z Rabatem</p>
                                        <p className="text-3xl font-black text-indigo-400">{revenueStats.discounts.rentals_with_discount}</p>
                                    </div>
                                    <div className="bg-black/20 p-6 rounded-[2rem] border border-white/5">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Średni Rabat</p>
                                        <p className="text-3xl font-black text-emerald-400">{revenueStats.discounts.avg_discount} PLN</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
