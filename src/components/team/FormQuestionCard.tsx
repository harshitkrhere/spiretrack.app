import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  const questionTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'long_text', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'rating', label: 'Rating (1-10)' }
  ];

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 flex items-center justify-center bg-gray-900 text-white text-xs font-medium rounded-full">
            {index + 1}
          </span>
          <span className="text-sm text-gray-400">Question</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Move controls */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMove('down')}
            disabled={index === totalQuestions - 1}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </motion.button>
          {/* Delete */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 ml-2"
          >
            <TrashIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Question Text Input */}
      <div className="px-5 py-4">
        <input
          type="text"
          value={question.question_text}
          onChange={(e) => onUpdate({ question_text: e.target.value })}
          placeholder="Enter your question..."
          className="w-full text-base text-gray-900 placeholder-gray-300 bg-transparent border-none focus:outline-none focus:ring-0"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
        />
      </div>

      {/* Settings Row */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
        {/* Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Type</span>
          <select
            value={question.question_type}
            onChange={(e) => onUpdate({ question_type: e.target.value as Question['question_type'] })}
            className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer"
          >
            {questionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Required toggle */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={question.is_required}
              onChange={(e) => onUpdate({ is_required: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${
              question.is_required ? 'bg-gray-900' : 'bg-gray-200'
            }`}>
              <motion.div
                animate={{ x: question.is_required ? 16 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full shadow-sm mt-0.5"
              />
            </div>
          </div>
          <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Required</span>
        </label>
      </div>
    </motion.div>
  );
};
