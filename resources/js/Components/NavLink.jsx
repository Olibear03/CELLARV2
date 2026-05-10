import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-teal-600 text-teal-600 focus:border-teal-600'
                    : 'border-transparent text-blue-500 hover:border-teal-600 hover:text-teal-600 focus:border-teal-600 focus:text-teal-600') +
                className
            }
        >
            {children}
        </Link>
    );
}
