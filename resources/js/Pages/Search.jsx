import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Search page — full-text search across the document repository.
 * Layout matches the standard used across Documents, Links, Bin, etc.
 */
export default function Search() {
    const [query, setQuery]             = useState('');
    const [year, setYear]               = useState('');
    const [ratingPeriod, setRatingPeriod] = useState('');

    return (
        <AuthenticatedLayout>
            <Head title="Search" />

            <div className="max-w-[1100px] mx-auto space-y-4">

                {/* Page header */}
                <div>
                    <h1 className="text-[2rem] font-extrabold text-gray-900 tracking-tight leading-none">Search</h1>
                    <p className="text-gray-500 text-sm mt-1">Search across documents, links, and files in the repository.</p>
                </div>

                {/* Search bar + filters */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                    {/* Main search input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                            placeholder="Search by title, author, or keyword..."
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Filters:
                        </div>

                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 gap-2">
                            <span className="text-gray-500 text-sm">Year:</span>
                            <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-transparent border-none text-sm font-semibold text-gray-900 p-0 focus:ring-0 cursor-pointer">
                                <option value="">All</option>
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                            </select>
                        </div>

                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 gap-2">
                            <span className="text-gray-500 text-sm">Rating Period:</span>
                            <select value={ratingPeriod} onChange={(e) => setRatingPeriod(e.target.value)} className="bg-transparent border-none text-sm font-semibold text-gray-900 p-0 focus:ring-0 cursor-pointer">
                                <option value="">All</option>
                                <option value="Jan-Jun">Jan-Jun</option>
                                <option value="Jul-Dec">Jul-Dec</option>
                            </select>
                        </div>

                        <span className="ml-auto text-sm text-gray-400">0 results</span>
                    </div>
                </div>

                {/* Empty state */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center py-24">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 border border-gray-100">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-700 font-semibold text-sm">No results found</p>
                    <p className="text-gray-400 text-sm mt-1 max-w-xs">Once files are uploaded, they'll be searchable here using the filters above.</p>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
