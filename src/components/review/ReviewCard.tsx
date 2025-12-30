import React from 'react';
import { cn } from '../../lib/utils';

interface ReviewCardProps {
    question: string;
    description?: string;
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
    onSkip?: () => void;
    isLast?: boolean;
    placeholder?: string;
    type?: 'text' | 'rating';
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
    question,
    description,
    value,
    onChange,
    onNext,
    onSkip,
    isLast,
    placeholder,
    type = 'text'
}) => {
    return (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex-1 space-y-4 mb-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-slate-800 leading-tight">{question}</h3>
                    {description && (
                        <p className="text-slate-500 text-sm">{description}</p>
                    )}
                </div>

                {type === 'text' ? (
                    <textarea
                        className={cn(
                            "w-full h-48 p-6 rounded-[1.5rem] border-none bg-white shadow-sm",
                            "focus:outline-none focus:ring-0 transition-all duration-200",
                            "resize-none text-base text-slate-700 placeholder:text-slate-300"
                        )}
                        placeholder={placeholder || "Type your answer here..."}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        autoFocus
                    />
                ) : (
                    <div className="grid grid-cols-5 gap-3 sm:gap-4 py-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                                key={num}
                                onClick={() => onChange(num.toString())}
                                className={cn(
                                    "h-14 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105",
                                    value === num.toString()
                                        ? "bg-slate-800 text-white shadow-lg scale-105"
                                        : "bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-sm"
                                )}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-2">
                    {onSkip && (
                        <button 
                            onClick={onSkip} 
                            type="button"
                            className="text-slate-800 font-medium hover:text-slate-600 px-4 py-2 transition-colors"
                        >
                            Skip
                        </button>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onNext}
                        disabled={!value.trim() && !onSkip}
                        className={cn(
                            "bg-[#FF6B4A] text-white font-medium px-8 py-3 rounded-full shadow-md hover:bg-[#E85A3A] transition-all transform hover:-translate-y-0.5",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        )}
                    >
                        {isLast ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};
