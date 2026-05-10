import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';

/**
 * MoveModal — Google Drive-style folder picker.
 *
 * Lets the user browse the folder tree and pick a destination.
 * Shows the current path at the bottom, and a Move button once
 * a destination is selected.
 *
 * Props:
 *   show        — boolean
 *   onClose     — () => void
 *   onMove      — (destinationFolderId: number|null) => void
 *   file        — the file/folder being moved { id, title }
 *   currentPath — the URL path the user is currently on (to exclude self)
 */
export default function MoveModal({ show, onClose, onMove, file, currentPath = '' }) {
    // browsedFolderId = null means we're at root
    const [browsedFolderId, setBrowsedFolderId] = useState(null);
    const [browsedPath, setBrowsedPath]         = useState([]); // [{id, title}]
    const [folders, setFolders]                 = useState([]);
    const [loading, setLoading]                 = useState(false);
    const [selectedId, setSelectedId]           = useState(undefined); // undefined = nothing chosen yet
    // undefined = not chosen, null = root chosen, number = folder id chosen

    // Reset when modal opens
    useEffect(() => {
        if (show) {
            setBrowsedFolderId(null);
            setBrowsedPath([]);
            setSelectedId(undefined);
        }
    }, [show]);

    // Fetch folders whenever we browse into a different location
    useEffect(() => {
        if (!show) return;
        setLoading(true);
        axios
            .get('/api/folders', { params: { parent_id: browsedFolderId, exclude: file?.id } })
            .then(res => setFolders(res.data))
            .catch(() => setFolders([]))
            .finally(() => setLoading(false));
    }, [show, browsedFolderId, file?.id]);

    /* ── Navigate into a folder (double-click / chevron) ── */
    const browseInto = (folder) => {
        setBrowsedFolderId(folder.id);
        setBrowsedPath(prev => [...prev, { id: folder.id, title: folder.title }]);
        setSelectedId(folder.id); // auto-select when you enter
    };

    /* ── Navigate up via path breadcrumb ── */
    const browseUp = (index) => {
        if (index < 0) {
            // clicked root
            setBrowsedFolderId(null);
            setBrowsedPath([]);
            setSelectedId(null);
        } else {
            const crumb = browsedPath[index];
            setBrowsedFolderId(crumb.id);
            setBrowsedPath(prev => prev.slice(0, index + 1));
            setSelectedId(crumb.id);
        }
    };

    const handleMove = () => {
        if (selectedId === undefined) return;
        onMove(selectedId); // null = move to root
        onClose();
    };

    const canMove = selectedId !== undefined;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="bg-white rounded-2xl overflow-hidden">

                {/* ── Header ── */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Move "{file?.title}"
                            </h2>
                            {/* Current location pill */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-gray-500">Current location:</span>
                                <span className="inline-flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1 text-sm font-medium text-gray-700 bg-gray-50">
                                    {/* Drive icon */}
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    {currentPath ? currentPath.split('/').pop() : 'Documents'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Folder browser ── */}
                <div className="px-2 py-2 min-h-[280px] max-h-[340px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                            Loading…
                        </div>
                    ) : folders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <svg className="w-10 h-10 mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span className="text-sm">No folders here</span>
                        </div>
                    ) : (
                        <ul>
                            {folders.map(folder => {
                                const isSelected = selectedId === folder.id;
                                return (
                                    <li
                                        key={folder.id}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer select-none transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'hover:bg-gray-50 text-gray-800'
                                        }`}
                                        onClick={() => setSelectedId(folder.id)}
                                        onDoubleClick={() => browseInto(folder)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Folder icon */}
                                            <svg
                                                className={`w-5 h-5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                                            </svg>
                                            <span className="text-sm font-medium truncate">{folder.title}</span>
                                        </div>

                                        {/* Right side: Move shortcut + chevron to browse in */}
                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                            {isSelected && (
                                                <button
                                                    className="text-xs font-semibold text-blue-600 border border-blue-200 bg-white rounded-full px-3 py-1 hover:bg-blue-50 transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); handleMove(); }}
                                                >
                                                    Move
                                                </button>
                                            )}
                                            {/* Chevron to browse into subfolder */}
                                            <button
                                                className={`p-1 rounded-lg transition-colors ${isSelected ? 'text-blue-500 hover:bg-blue-100' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}`}
                                                onClick={(e) => { e.stopPropagation(); browseInto(folder); }}
                                                title="Browse into folder"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* ── Bottom: path trail + actions ── */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    {/* Path breadcrumb */}
                    <div className="flex items-center flex-wrap gap-1 text-sm text-gray-500 mb-4 min-h-[20px]">
                        <button
                            onClick={() => browseUp(-1)}
                            className="hover:text-blue-600 font-medium transition-colors"
                        >
                            Documents
                        </button>
                        {browsedPath.map((crumb, i) => (
                            <span key={crumb.id} className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                <button
                                    onClick={() => browseUp(i)}
                                    className={`font-medium transition-colors ${
                                        i === browsedPath.length - 1
                                            ? 'text-gray-800 font-semibold'
                                            : 'hover:text-blue-600'
                                    }`}
                                >
                                    {crumb.title}
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMove}
                            disabled={!canMove}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                                canMove
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Move
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
