import { useEffect, useCallback } from 'react';

/**
 * FilePreviewModal — full-screen in-page file preview, Google Drive style.
 *
 * Renders as a fixed overlay on top of the current page (no navigation).
 * Supports PDF and image previews via <iframe> / <img>.
 * Closes on Escape key or clicking the X button.
 *
 * Props:
 *   file    — { title, file_path, original_filename } | null
 *   onClose — () => void
 */
export default function FilePreviewModal({ file, onClose }) {
    const show = !!file;

    /* ── Close on Escape ── */
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (show) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent background scroll while preview is open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [show, handleKeyDown]);

    if (!show) return null;

    const fileUrl  = `/storage/${file.file_path}`;
    const filename = file.original_filename || file.title;
    const ext      = filename.split('.').pop()?.toLowerCase();
    const isImage  = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    const isPdf    = ext === 'pdf';

    return (
        /* Full-screen overlay */
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#1e1e1e]">

            {/* ── Top toolbar ── */}
            <div className="flex items-center justify-between px-4 h-14 bg-[#2d2d2d] border-b border-white/10 shrink-0">

                {/* Left: file icon + name */}
                <div className="flex items-center gap-3 min-w-0">
                    {/* PDF / image icon */}
                    {isPdf ? (
                        <div className="bg-red-500/20 text-red-400 p-1.5 rounded-md shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                    ) : isImage ? (
                        <div className="bg-blue-500/20 text-blue-400 p-1.5 rounded-md shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="bg-gray-500/20 text-gray-400 p-1.5 rounded-md shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                    )}
                    <span className="text-white text-sm font-medium truncate max-w-xs" title={filename}>
                        {filename}
                    </span>
                </div>

                {/* Right: action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* Open in new tab */}
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                        title="Open in new tab"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="hidden sm:inline">Open</span>
                    </a>

                    {/* Download */}
                    <a
                        href={fileUrl}
                        download={filename}
                        className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Download"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </a>

                    {/* Divider */}
                    <div className="w-px h-5 bg-white/20 mx-1" />

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Close (Esc)"
                        aria-label="Close preview"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Preview area ── */}
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#1e1e1e]">
                {isPdf ? (
                    /* PDF — rendered in iframe so the browser's native PDF viewer handles it */
                    <iframe
                        src={fileUrl}
                        className="w-full h-full border-0"
                        title={filename}
                    />
                ) : isImage ? (
                    /* Image — centered with max constraints */
                    <img
                        src={fileUrl}
                        alt={filename}
                        className="max-w-full max-h-full object-contain select-none"
                        draggable={false}
                    />
                ) : (
                    /* Unsupported format — show a download prompt */
                    <div className="flex flex-col items-center justify-center text-center p-12">
                        <div className="bg-white/10 p-6 rounded-2xl mb-6">
                            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                        <p className="text-white text-lg font-semibold mb-2">{filename}</p>
                        <p className="text-gray-400 text-sm mb-6">
                            Preview is not available for this file type.
                        </p>
                        <a
                            href={fileUrl}
                            download={filename}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download file
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
