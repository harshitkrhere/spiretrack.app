import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '../../lib/utils';

interface FixPlanProps {
    items: string[];
}

export const FixPlan: React.FC<FixPlanProps> = ({ items }) => {
    const [completed, setCompleted] = useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
        const next = new Set(completed);
        if (next.has(index)) {
            next.delete(index);
        } else {
            next.add(index);
        }
        setCompleted(next);
        // In a real app, persist this to DB
    };

    return (
        <Card className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Fix My Next Week</h3>
                <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded-full">
                    Action Plan
                </span>
            </div>
            <div className="space-y-3">
                {items.map((item, index) => {
                    const isDone = completed.has(index);
                    return (
                        <div
                            key={index}
                            onClick={() => toggleItem(index)}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                                isDone ? "bg-slate-50" : "hover:bg-slate-50"
                            )}
                        >
                            {isDone ? (
                                <CheckCircleSolidIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                            ) : (
                                <CheckCircleIcon className="h-6 w-6 text-slate-400 flex-shrink-0" />
                            )}
                            <span className={cn(
                                "text-sm text-slate-700 pt-0.5",
                                isDone && "line-through text-slate-400"
                            )}>
                                {item}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
