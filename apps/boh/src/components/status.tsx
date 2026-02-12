import { useRef, useEffect } from 'react';

// Placeholder for timer logic
export function Timer({ duration }: { duration: number }) {
    const timeLeft = duration * 60; // Mock seconds
    const progress = 75; // Mock progress

    return (
        <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-jet-700">
            <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-jet-500"
                />
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * progress) / 100}
                    className="text-teal-bright transition-all duration-300"
                />
            </svg>
            <span className="text-xs font-bold font-mono">15:00</span>
        </div>
    );
}

export function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="h-2 w-full bg-jet-700 rounded-full overflow-hidden">
            <div
                className="h-full bg-teal-mid transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
