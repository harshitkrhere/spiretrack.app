import React from 'react';
import { cn } from '../../lib/utils';

interface ScoreRingProps {
    score: number;
    label: string;
    color?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, label, color = 'text-primary-600' }) => {
    const circumference = 2 * Math.PI * 40; // radius 40
    const offset = circumference - (score / 10) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative h-24 w-24">
                <svg className="h-full w-full transform -rotate-90">
                    <circle
                        className="text-slate-100"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="48"
                        cy="48"
                    />
                    <circle
                        className={cn("transition-all duration-1000 ease-out", color)}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="48"
                        cy="48"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{score}</span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium text-slate-600">{label}</span>
        </div>
    );
};
