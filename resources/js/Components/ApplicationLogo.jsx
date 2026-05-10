export default function ApplicationLogo(props) {
    return (
        <img 
            {...props} 
            src="/CELLAR_logo.jpg" 
            alt="Cellar Logo" 
            className="w-40 h-50" // Adjust size here
        />
    );
}
