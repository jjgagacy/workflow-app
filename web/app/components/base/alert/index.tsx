'use client';

export function ErrorAlert({ message }: { message: string}) {
    return (
        <div role="alert" className="bg-red-100 text-red-700 p-4 rounded mb-2">
            {message}
        </div>
    )
}

export function WarningAlert({ message }: { message: string}) {
    return (
        <div role="alert" className="bg-yellow-100 text-yellow-700 p-4 rounded mb-2">
            {message}
        </div>
    )
}
