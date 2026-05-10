import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Modal from '@/Components/Modal';

/**
 * EditLinkModal — edit an existing link entry.
 * Pre-fills all fields from the existing link object.
 *
 * Props:
 *   show    — boolean
 *   onClose — () => void
 *   link    — { id, title, file_path, description, metadata } | null
 */
export default function EditLinkModal({ show, onClose, link }) {
    const { data, setData, patch, processing, reset, errors, clearErrors } = useForm({
        title:        '',
        url:          '',
        description:  '',
        keywords:     '',
        confidential: false,
    });

    // Pre-fill when modal opens with a link
    useEffect(() => {
        if (show && link) {
            setData({
                title:        link.title ?? '',
                url:          link.file_path ?? '',
                description:  link.description ?? '',
                keywords:     link.metadata?.keywords ?? '',
                confidential: link.metadata?.confidential ?? false,
            });
        }
        if (!show) { reset(); clearErrors(); }
    }, [show, link?.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('links.update', link.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    const handleClose = () => { reset(); clearErrors(); onClose(); };
    const canSubmit = data.title.trim() && data.url.trim() && !processing;

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="bg-white rounded-2xl p-7">
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Edit Link</h2>
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5 ml-7">Update the link details.</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            autoFocus
                            className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL <span className="text-red-500">*</span></label>
                        <input
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                            placeholder="https://..."
                        />
                        {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors resize-none"
                        />
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                        <input
                            type="text"
                            value={data.keywords}
                            onChange={(e) => setData('keywords', e.target.value)}
                            className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                            placeholder="e.g. portal, external, reference"
                        />
                    </div>

                    {/* Confidential */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={data.confidential}
                            onChange={(e) => setData('confidential', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Mark as confidential (Proficiency)</span>
                    </label>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={handleClose} className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${canSubmit ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
