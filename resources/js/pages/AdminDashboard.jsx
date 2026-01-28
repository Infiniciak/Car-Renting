import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
    ScatterChart, Scatter, ComposedChart, Line
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);

    // Profesjonalna paleta kolorów: Indigo, Violet, Rose, Amber, Emerald
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#fbbf24', '#10b981'];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Błąd statystyk", err);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return (
        <div className="min-h-screen bg-[#11111d] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-400 font-black tracking-widest uppercase text-xs">Analiza pojazdów...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#11111d] p-8 text-white font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Dashboard</h1>
                        <p className="text-indigo-400 font-medium mt-2 italic">Statystyki pojazdów</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Ostatnia aktualizacja</p>
                        <p className="text-xs font-bold text-gray-400">{new Date().toLocaleString()}</p>
                    </div>
                </header>

                {/* KAFELKI KPI */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Wszystkie Auta', val: stats.general.total_cars, color: 'text-indigo-400', sub: 'Liczba pojazdów' },
                        { label: 'Dostępne', val: stats.general.available_cars, color: 'text-emerald-400', sub: 'Gotowe do wynajmu' },
                        { label: 'Średni Rocznik', val: stats.general.avg_year, color: 'text-blue-400'},
                        { label: 'Przychód / Doba', val: `${stats.general.total_value} PLN`, color: 'text-rose-400', sub: 'Maks. potencjał' }
                    ].map((kpi, i) => (
                        <div key={i} className="bg-[#1e1e2d] p-7 rounded-[2.5rem] border border-white/5 shadow-2xl group transition-all hover:bg-[#252538]">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                            <p className={`text-3xl font-black ${kpi.color} tracking-tighter`}>{kpi.val}</p>
                            <div className="h-1 w-8 bg-white/5 mt-3 group-hover:w-full transition-all duration-500"></div>
                            <p className="text-[9px] text-gray-600 mt-2 font-bold uppercase">{kpi.sub}</p>
                        </div>
                    ))}
                </div>

                {/* RZĄD 1: GŁÓWNE STRUKTURY */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl h-[450px]">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400 border-l-4 border-indigo-500 pl-4">Typy Nadwozia</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={stats.by_type}
                                    dataKey="total"
                                    nameKey="type"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                >
                                    {stats.by_type.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#11111d', border: 'none', borderRadius: '15px', fontSize: '12px'}} />
                                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl h-[450px]">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400 border-l-4 border-rose-500 pl-4">Ceny Średnie</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={stats.avg_prices}>
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

                {/* RZĄD 2: ANALIZA SZCZEGÓŁOWA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl h-[400px]">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-gray-400 border-l-4 border-emerald-500 pl-4">Rodzaje Paliwa</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={stats.fuel_stats} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="fuel_type" type="category" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} width={80} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#11111d', border: 'none'}} />
                                <Bar dataKey="total" fill="#10b981" radius={[0, 10, 10, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-[#1e1e2d] p-8 rounded-[3rem] border border-white/5 shadow-xl flex flex-col">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">Pojazdy w miastach</h3>
                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                            {stats.city_stats.map((city, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded-[1.5rem] border border-white/5 transition-hover hover:border-indigo-500/30">
                                    <span className="text-xs font-bold uppercase tracking-tight">{city.city}</span>
                                    <span className="text-indigo-400 font-black text-xs">{city.total} szt.</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
