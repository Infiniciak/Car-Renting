import React from 'react';

const PaginationDark = ({ currentPage, lastPage, onPageChange, total, perPage }) => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(lastPage, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    if (lastPage <= 1) return null;

    return (
        <div className="flex items-center justify-between mt-8 px-4">
            <p className="text-sm text-gray-400">
                Wyświetlanie {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, total)} z {total} wyników
            </p>

            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-[#1e1e2d] border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                >
                    ← Poprzednia
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-[#1e1e2d] border border-white/10 hover:bg-white/5 text-white"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="px-2 py-2 text-gray-500">...</span>}
                    </>
                )}

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                            currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[#1e1e2d] border border-white/10 hover:bg-white/5 text-white'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {endPage < lastPage && (
                    <>
                        {endPage < lastPage - 1 && <span className="px-2 py-2 text-gray-500">...</span>}
                        <button
                            onClick={() => onPageChange(lastPage)}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-[#1e1e2d] border border-white/10 hover:bg-white/5 text-white"
                        >
                            {lastPage}
                        </button>
                    </>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="px-4 py-2 rounded-xl font-bold text-sm bg-[#1e1e2d] border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition text-white"
                >
                    Następna →
                </button>
            </div>
        </div>
    );
};

export default PaginationDark;
