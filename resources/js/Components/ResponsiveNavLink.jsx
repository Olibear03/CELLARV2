import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-teal-600 bg-teal-50 text-teal-700 focus:border-teal-700 focus:bg-teal-100 focus:text-teal-800'
                    : 'border-transparent text-blue-600 hover:border-teal-600 hover:bg-stone-100 hover:text-teal-700 focus:border-teal-600 focus:bg-stone-100 focus:text-teal-700'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
