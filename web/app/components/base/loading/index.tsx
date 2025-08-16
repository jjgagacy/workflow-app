type LoadingProps = {
    type?: 'area' | 'app';
}

const Loading = ({ type }: LoadingProps = { type: 'area'}) => {
    return (
        <div className={`flex w-full items-center justify-center ${type === 'app' ? 'h-full' : ''}`}>
            <div className="flex space-x-2 spin-animation">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-gray-500"></div>
            </div>
        </div>
    );
}

export default Loading;
