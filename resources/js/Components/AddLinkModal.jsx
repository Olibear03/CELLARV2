import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Modal from '@/Components/Modal';

/**
 * AddLinkModal — saves an external URL resource to the repository.
 *
 * Posts to POST /links (links.store) — a dedicated endpoint that does NOT
 * require a file upload, unlike the generic upload.store route.
 *
 * Fields: Title * | URL * | Description | Keywords | Mark as confidential
 */
export default function AddLinkModal({ show, onClose, categories = [], defaultCategory = '' }) {
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        title:        '',
        url:          '',
        description:  '',
        keywords:     '',
        confidential: false,
        category_id:  defaultCategory,
    });

    // Reset form whenever the modal is opened fresh
    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
        }
    }, [show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('links.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const canSubmit = data.title.trim() && data.url.trim() && !processing;

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="bg-white rounded-2xl p-7">

                {/* ── Header ── */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            {/* Chain-link icon */}
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Add Link</h2>
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5 ml-7">Save an external resource to the repository.</p>
                    </div>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            autoFocus
                            className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g. CHED Official Website"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL <span className="text-red-500">*</span>
                        </label>
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
                            placeholder="Optional description..."
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

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                canSubmit
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {processing ? 'Adding…' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
