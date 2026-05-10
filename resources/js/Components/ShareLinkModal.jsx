import { useState, useRef, useEffect } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';

/**
 * ShareLinkModal — generates a temporary guest-access link for a file.
 *
 * The user picks an expiry amount + unit (Hours / Days) using a custom
 * styled dropdown (not a native <select>) so the options list can have
 * rounded corners matching the rest of the UI.
 *
 * Flow:
 *   1. User sets amount + unit
 *   2. Clicks "Generate Link"
 *   3. Backend returns a signed URL valid for the chosen duration
 *   4. URL is displayed with a Copy button
 *
 * Props:
 *   show    — boolean
 *   onClose — () => void
 *   file    — { id, title } | null
 */
export default function ShareLinkModal({ show, onClose, file }) {
    const [amount, setAmount]             = useState(24);
    const [unit, setUnit]                 = useState('hours');   // 'hours' | 'days'
    const [unitMenuOpen, setUnitMenuOpen] = useState(false);     // custom dropdown open state
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [loading, setLoading]           = useState(false);
    const [copied, setCopied]             = useState(false);
    const [error, setError]               = useState('');

    // Ref used to close the unit dropdown when clicking outside
    const unitMenuRef = useRef(null);

    /* ── Close unit dropdown on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (unitMenuRef.current && !unitMenuRef.current.contains(e.target)) {
                setUnitMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Reset all state when the modal closes ── */
    const handleClose = () => {
        setGeneratedUrl('');
        setCopied(false);
        setError('');
        setAmount(24);
        setUnit('hours');
        setUnitMenuOpen(false);
        onClose();
    };

    /* ── Unit options ── */
    const unitOptions = [
        { value: 'hours', label: 'Hours' },
        { value: 'days',  label: 'Days'  },
    ];

    /* ── Generate the signed link via the backend ── */
    const handleGenerate = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        setGeneratedUrl('');
        try {
            const res = await axios.post('/share-link', {
                file_id: file.id,
                amount:  parseInt(amount, 10),
                unit,
            });
            setGeneratedUrl(res.data.url);
        } catch (e) {
            setError(e.response?.data?.message ?? 'Failed to generate link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Copy generated URL to clipboard ── */
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedUrl);
        } catch {
            // Fallback for browsers without clipboard API
            const el = document.createElement('textarea');
            el.value = generatedUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    /* ── Human-readable expiry summary ── */
    const expiryLabel = `${amount} ${
        unit === 'hours'
            ? amount === 1 ? 'hour' : 'hours'
            : amount === 1 ? 'day'  : 'days'
    }`;

    return (
        <Modal show={show} onClose={handleClose} maxWidth="sm">
            <div className="bg-white rounded-2xl p-7">

                {/* ── Header ── */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            {/* Share / network icon */}
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Share Link</h2>
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5 ml-7">
                            Generate a guest link for "{file?.title}".
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Token Expiry label ── */}
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Token Expiry
                </div>

                {/* ── Amount input + custom unit picker ── */}
                <div className="flex gap-3 mb-3">

                    {/* Numeric amount input */}
                    <input
                        type="number"
                        min={1}
                        max={unit === 'hours' ? 720 : 365}
                        value={amount}
                        onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors outline-none"
                    />

                    {/* ── Custom unit dropdown — fully styled, rounded corners ── */}
                    <div className="relative" ref={unitMenuRef}>
                        {/* Trigger button — shows selected unit */}
                        <button
                            type="button"
                            onClick={() => setUnitMenuOpen(!unitMenuOpen)}
                            className={`flex items-center gap-2 border-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-white transition-colors min-w-[100px] justify-between ${
                                unitMenuOpen
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-blue-400 text-gray-800 hover:border-blue-500'
                            }`}
                        >
                            <span>{unitOptions.find(o => o.value === unit)?.label}</span>
                            {/* Chevron — rotates when open */}
                            <svg
                                className={`w-4 h-4 transition-transform shrink-0 ${unitMenuOpen ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown options list — rounded corners, shadow */}
                        {unitMenuOpen && (
                            <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden min-w-[100px]">
                                {unitOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            setUnit(option.value);
                                            setUnitMenuOpen(false);
                                            // Reset amount to a sensible default when switching units
                                            if (option.value === 'hours' && amount > 720) setAmount(24);
                                            if (option.value === 'days'  && amount > 365) setAmount(7);
                                        }}
                                        className={`w-full px-5 py-3 text-sm font-semibold text-left transition-colors ${
                                            unit === option.value
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Helper text ── */}
                <p className="text-xs text-gray-400 mb-5">
                    Guests with this link can access the document until it expires ({expiryLabel}).
                </p>

                {/* ── Error message ── */}
                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                        {error}
                    </p>
                )}

                {/* ── Generated URL display with copy button ── */}
                {generatedUrl && (
                    <div className="mb-5">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                            {/* Truncated URL */}
                            <p className="flex-1 text-xs text-gray-600 truncate font-mono">{generatedUrl}</p>

                            {/* Copy button */}
                            <button
                                onClick={handleCopy}
                                className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                    copied
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Action buttons ── */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                {/* Spinner */}
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Generating…
                            </>
                        ) : (
                            <>
                                {/* Link icon */}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Generate Link
                            </>
                        )}
                    </button>
                </div>

            </div>
        </Modal>
    );
}
