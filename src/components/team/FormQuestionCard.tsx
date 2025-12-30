import React from 'react';

interface Question {
  id?: string;
  question_text: string;
  question_type: 'text' | 'long_text' | 'number' | 'rating';
  position: number;
  is_required: boolean;
}

interface FormQuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

export const FormQuestionCard: React.FC<FormQuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  onUpdate,
  onDelete,
  onMove
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#e5e5e7] overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e7] bg-[#f5f5f7]">
        <span className="text-[13px] text-[#86868b]">{index + 1}</span>
        <div className="flex items-center gap-3">
          {/* Move controls */}
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↑
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === totalQuestions - 1}
            className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↓
          </button>
          {/* Delete - subdued */}
          <button
            onClick={onDelete}
            className="text-[12px] text-[#86868b] hover:text-[#ff3b30] transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="px-4 py-3 border-b border-[#e5e5e7]">
        <input
          type="text"
          value={question.question_text}
          onChange={(e) => onUpdate({ question_text: e.target.value })}
          placeholder="Enter your question..."
          className="w-full text-[15px] text-[#1d1d1f] placeholder-[#aeaeb2] bg-transparent border-none focus:outline-none"
        />
      </div>

      {/* Settings Row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Type */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#86868b]">Type:</span>
          <select
            value={question.question_type}
            onChange={(e) => onUpdate({ question_type: e.target.value as Question['question_type'] })}
            className="text-[13px] text-[#1d1d1f] bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="text">Short Text</option>
            <option value="long_text">Long Text</option>
            <option value="number">Number</option>
            <option value="rating">Rating (1-10)</option>
          </select>
        </div>

        {/* Required toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.is_required}
            onChange={(e) => onUpdate({ is_required: e.target.checked })}
            className="w-4 h-4 rounded border-[#e5e5e7] text-[#007aff] focus:ring-0 focus:ring-offset-0"
          />
          <span className="text-[13px] text-[#86868b]">Required</span>
        </label>
      </div>
    </div>
  );
};
