import { Link } from '@inertiajs/react';

/**
 * Breadcrumbs — reusable navigation trail.
 *
 * Props:
 *   items: Array of { label: string, href?: string }
 *          Items without href are rendered as plain text (current page).
 *          Items with href are rendered as clickable links.
 *
 * The home icon always appears first and links to the dashboard.
 *
 * Example:
 *   <Breadcrumbs items={[
 *     { label: 'Documents', href: route('documents') },
 *     { label: 'Year 2026',  href: route('documents', { folder_id: 5 }) },
 *     { label: 'Jan-Jun' },   // no href = current page
 *   ]} />
 */
export default function Breadcrumbs({ items = [] }) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-y-1 text-sm text-gray-500">

            {/* Home icon — links to Documents root (Documents is the home of this section) */}
            <Link
                href="/documents"
                className="flex items-center text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                aria-label="Documents home"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </Link>

            {/* Dynamic segments */}
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const isCurrent = !item.href; // no href = this is the current page

                return (
                    <span key={index} className="flex items-center gap-1">
                        {/* Separator */}
                        <svg className="w-3.5 h-3.5 text-gray-300 shrink-0 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>

                        {/* Current page — bold, no link */}
                        {isCurrent || isLast ? (
                            <span className="font-semibold text-gray-700 truncate max-w-[160px]" aria-current="page" title={item.label}>
                                {item.label}
                            </span>
                        ) : (
                            /* Ancestor — clickable */
                            <Link
                                href={item.href}
                                className="text-gray-500 hover:text-blue-600 transition-colors font-medium truncate max-w-[160px]"
                                title={item.label}
                            >
                                {item.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
