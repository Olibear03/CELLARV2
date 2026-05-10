import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import FilePreviewModal from '@/Components/FilePreviewModal';

/**
 * Dashboard — matches the reference layout:
 *
 *  Row 1: Title + welcome
 *  Row 2: 3 stat cards  (Total Files | Total Links | Uploaded this Month)
 *  Row 3: Monthly Upload placeholder (left, 2/3) | Favorites panel (right, 1/3)
 *  Row 4: Recent Activity (full width)
 */
export default function Dashboard({
    totalFiles        = 0,
    totalLinks        = 0,
    uploadedThisMonth = 0,
    recentUploads     = [],
    favorites         = [],
}) {
    const user = usePage().props.auth.user;
    const [previewFile, setPreviewFile]   = useState(null);
    // Upload period selector: 'weekly' | 'monthly' | 'yearly'
    const [uploadPeriod, setUploadPeriod] = useState('monthly');
    const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

    const periodLabels = {
        weekly:  'Weekly Uploads',
        monthly: 'Monthly Uploads',
        yearly:  'Yearly Uploads',
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

    /* ── Reusable stat card ── */
    const StatCard = ({ icon, label, value }) => (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col gap-3">
            {/* Icon badge */}
            <div className="bg-emerald-800 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-4xl font-extrabold text-gray-900 leading-none mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1.5 font-medium">Live count</p>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="max-w-[1100px] mx-auto space-y-6">

                {/* ── Header ── */}
                <div>
                    <h1 className="text-[2.5rem] font-extrabold text-gray-900 tracking-tight leading-none">Dashboard</h1>
                    <p className="text-gray-500 font-semibold mt-1">Welcome Back, {user.name}</p>
                </div>

                {/* ── Row 1: 3 stat cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <StatCard
                        label="Total files"
                        value={totalFiles}
                        icon={
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Total Links"
                        value={totalLinks}
                        icon={
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        }
                    />
                    <StatCard
                        label="Uploaded this Month"
                        value={uploadedThisMonth}
                        icon={
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        }
                    />
                </div>

                {/* ── Row 2: Monthly Upload (placeholder) + Favorites ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Upload chart card — left 2/3 */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[280px] flex flex-col">
                        {/* Header with period selector */}
                        <div className="flex items-center gap-2 mb-4 relative">
                            <h2 className="text-lg font-bold text-gray-900">{periodLabels[uploadPeriod]}</h2>
                            {/* Period dropdown trigger */}
                            <button
                                onClick={() => setPeriodMenuOpen(!periodMenuOpen)}
                                className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Change period"
                            >
                                <svg className={`w-4 h-4 transition-transform ${periodMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Period dropdown menu */}
                            {periodMenuOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div className="fixed inset-0 z-40" onClick={() => setPeriodMenuOpen(false)} />
                                    <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-44">
                                        {[
                                            { key: 'weekly',  label: 'Weekly Uploads',  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                            { key: 'monthly', label: 'Monthly Uploads', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                                            { key: 'yearly',  label: 'Yearly Uploads',  icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                                        ].map(({ key, label, icon }) => (
                                            <button
                                                key={key}
                                                onClick={() => { setUploadPeriod(key); setPeriodMenuOpen(false); }}
                                                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                                    uploadPeriod === key
                                                        ? 'text-blue-600 bg-blue-50 font-semibold'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                                                </svg>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Chart placeholder */}
                        <div className="flex-1 flex items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200">
                            <div className="text-center">
                                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-sm text-gray-400 font-medium">Chart coming soon</p>
                                <p className="text-xs text-gray-300 mt-0.5">Showing: {periodLabels[uploadPeriod]}</p>
                            </div>
                        </div>
                    </div>

                    {/* Favorites panel — right 1/3 */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Favorites</h2>
                            <Link href={route('favorites.index')} className="text-xs text-emerald-700 font-semibold hover:underline">
                                View all
                            </Link>
                        </div>

                        {favorites.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                                <svg className="w-10 h-10 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <p className="text-sm text-gray-400">No favorites yet</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {favorites.map((file) => {
                                    const isLink   = file.metadata?.type === 'link';
                                    const isFolder = file.metadata?.type === 'folder';

                                    const handleClick = () => {
                                        if (isLink) {
                                            window.open(file.file_path, '_blank', 'noopener,noreferrer');
                                        } else if (isFolder) {
                                            window.location.href = `/documents/${file.title}`;
                                        } else {
                                            setPreviewFile(file);
                                        }
                                    };

                                    return (
                                        <li
                                            key={file.id}
                                            onClick={handleClick}
                                            className="flex items-center gap-3 cursor-pointer rounded-xl p-2 -mx-2 hover:bg-gray-50 transition-colors group"
                                            title={isLink ? 'Open link' : isFolder ? 'Open folder' : 'Preview file'}
                                        >
                                            {/* Icon */}
                                            <div className={`p-2 rounded-lg shrink-0 ${isFolder ? 'bg-amber-100 text-amber-500' : 'bg-emerald-800 text-white'}`}>
                                                {isLink ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                ) : isFolder ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            {/* Name + meta */}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{file.title}</p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {file.user?.name ?? 'Unknown'}
                                                    {file.metadata?.year && ` · ${file.metadata.year}`}
                                                    {file.metadata?.rating_period && ` ${file.metadata.rating_period}`}
                                                </p>
                                            </div>
                                            {/* Arrow hint on hover */}
                                            <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* ── Row 3: Recent Activity ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <p className="text-gray-400 text-xs mt-0.5">Latest uploads across the repository</p>
                    </div>

                    {recentUploads.length === 0 ? (
                        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                            <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 font-medium text-sm">No activity yet</p>
                            <p className="text-gray-400 text-xs mt-1">Uploaded files will appear here.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recentUploads.map((file) => (
                                <li key={file.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                                    {/* File icon */}
                                    <div className="bg-emerald-800 p-2.5 rounded-xl shrink-0">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    {/* Name */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{file.title}</p>
                                        {file.original_filename && file.original_filename !== 'folder' && (
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{file.original_filename}</p>
                                        )}
                                    </div>
                                    {/* Date */}
                                    <span className="text-sm text-gray-400 shrink-0">{formatDate(file.created_at)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>

            {/* File preview — opens when clicking a file in Favorites */}
            <FilePreviewModal
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </AuthenticatedLayout>
    );
}