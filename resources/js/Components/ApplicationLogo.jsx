export default function ApplicationLogo({ className = 'w-40 h-auto', ...props }) {
    return (
        <img
            {...props}
            src="/CELLAR_logo.png"
            alt="Cellar Logo"
            className={className}
        />
    );
}
