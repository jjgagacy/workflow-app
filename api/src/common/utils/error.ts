interface ErrorDetails {
    message: string;
    name: string;
    stack: string;
    stackLines: string[];
    timestamp: string;
    additionalInfo?: Record<string, any>;
}

export function getErrorDetails(error: unknown): ErrorDetails {
    const details: ErrorDetails = {
        message: 'Unknown error',
        name: 'Error',
        stack: '',
        stackLines: [],
        timestamp: new Date().toISOString(),
    }

    if (error instanceof Error) {
        details.message = error.message;
        details.name = error.name;
        details.stack = error.stack || '';
        details.stackLines = error.stack?.split('\n').map(line => line.trim()) || [];
    } else if (typeof error === 'string') {
        details.message = error;
    } else {
        details.message = JSON.stringify(error);
    }

    return details;
}