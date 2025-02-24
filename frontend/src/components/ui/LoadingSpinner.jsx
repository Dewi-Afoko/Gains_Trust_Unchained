const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center h-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
        </div>
    );
};

export default LoadingSpinner;
