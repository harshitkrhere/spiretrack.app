import React from 'react';
import { Input } from '../ui/Input';

interface SnapshotQuestion {
  id: string;
  snapshot_question_text: string;
  snapshot_question_type: 'text' | 'long_text' | 'number' | 'rating';
  snapshot_position: number;
  is_required_at_snapshot: boolean;
}

interface DynamicQuestionRendererProps {
  question: SnapshotQuestion;
  value: string | number | null;
  onChange: (value: string | number) => void;
  error?: string;
}

export const DynamicQuestionRenderer: React.FC<DynamicQuestionRendererProps> = ({
  question,
  value,
  onChange,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (question.snapshot_question_type === 'number') {
      onChange(val === '' ? '' : Number(val));
    } else {
      onChange(val);
    }
  };

  const renderInput = () => {
    switch (question.snapshot_question_type) {
      case 'long_text':
        return (
          <textarea
            value={value?.toString() || ''}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
            }`}
            placeholder="Type your answer here..."
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value?.toString() || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
            }`}
            placeholder="0"
          />
        );

      case 'rating':
        return (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={`w-10 h-10 rounded-md font-medium transition-colors ${
                  value === num
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value?.toString() || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
            }`}
            placeholder="Type your answer here..."
          />
        );
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-900 mb-2">
        {question.snapshot_question_text}
        {question.is_required_at_snapshot && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
