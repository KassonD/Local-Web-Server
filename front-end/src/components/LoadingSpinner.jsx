
function LoadingSpinner({text = "", size = "large"}) {
    return (
        <div className="loading-container">
            {text != "" && (
                <p className={`loading-text ${size}`}>{text}</p>
            )}
            <div className={`loading-spinner ${size}`}></div>
        </div>
    );
}

export default LoadingSpinner;