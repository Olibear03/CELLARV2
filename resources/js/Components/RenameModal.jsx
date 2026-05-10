import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';

/**
 * RenameModal — clean modal for renaming a file or folder.
 *
 * Props:
 *   show     — boolean
 *   onClose  — () => void
 *   onRename — (newName: string) => void
 *   file     — { title } | null
 */
export default function RenameModal({ show, onClose, onRename, file }) {
    const [name, setName] = useState('');

    // Pre-fill with current name when modal opens
    useEffect(() => {
        if (show && file) setName(file.title);
    }, [show, file]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || trimmed === file?.title) { onClose(); return; }
        onRename(trimmed);
        onClose();
    };

    const handleClose = () => { setName(''); onClose(); };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="sm">
            <div className="bg-white rounded-2xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        {/* Pencil icon */}
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h2 className="text-lg font-bold text-gray-900">Rename</h2>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        className="w-full border border-blue-400 bg-white rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-5"
                        placeholder="Enter new name"
                        onFocus={(e) => {
                            // Select text up to the extension so user can type over just the name
                            const val = e.target.value;
                            const dotIdx = val.lastIndexOf('.');
                            e.target.setSelectionRange(0, dotIdx > 0 ? dotIdx : val.length);
                        }}
                    />
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={handleClose} className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${name.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            Rename
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
