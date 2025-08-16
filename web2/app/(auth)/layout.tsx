import React from "react";
import SwrInitializer from "../components/swr-initializer";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br 'from-blue-50 to-gray-100 dark:bg-black dark:from-black dark:to-black p-4`}>
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <SwrInitializer>
                        {children}
                    </SwrInitializer>
                </div>
            </div>
        </div>
    );
}