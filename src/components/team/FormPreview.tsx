import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface Question {
  id?: string;
  question_text: string;
  question_type: 'text' | 'long_text' | 'number' | 'rating';
  position: number;
  is_required: boolean;
}

interface FormPreviewProps {
  questions: Question[];
}

export const FormPreview: React.FC<FormPreviewProps> = ({ questions }) => {
  const renderQuestionPreview = (question: Question) => {
    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-400 placeholder-gray-300";
    
    switch (question.question_type) {
      case 'text':
        return (
          <input
            type="text"
            disabled
            placeholder="Short answer"
            className={inputClass}
          />
        );
      case 'long_text':
        return (
          <textarea
            disabled
            rows={3}
            placeholder="Long answer"
            className={inputClass + " resize-none"}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            disabled
            placeholder="Number"
            className={inputClass + " max-w-[140px]"}
          />
        );
      case 'rating':
        return (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <motion.div
                key={num}
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-300 transition-colors cursor-pointer"
              >
                {num}
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-3xl p-6 border border-gray-200">
      {/* Device Frame Header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500 font-medium">Member View</span>
      </div>

      {/* Preview Content (Mock Phone) */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200/50">
        {/* Mock Status Bar */}
        <div className="h-6 bg-gray-900 flex items-center justify-center">
          <div className="w-20 h-1 bg-white/30 rounded-full"></div>
        </div>

        {/* Content Area */}
        <div className="p-5">
          <AnimatePresence mode="popLayout">
            {questions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center"
              >
                <p className="text-gray-400 text-sm">Add questions to see preview</p>
              </motion.div>
            ) : (
              <motion.div
                key="questions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {questions.map((question, index) => (
                  <motion.div 
                    key={question.id || `preview-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      <span className="text-gray-400 mr-1">{index + 1}.</span>
                      {question.question_text || 'Untitled question'}
                      {question.is_required && (
                        <span className="text-red-400 ml-1">*</span>
                      )}
                    </label>
                    {renderQuestionPreview(question)}
                  </motion.div>
                ))}

                {/* Mock Submit Button */}
                {questions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4"
                  >
                    <div className="w-full py-3 bg-gray-900 text-white text-sm font-medium text-center rounded-xl opacity-50">
                      Submit Review
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mock Home Indicator */}
        <div className="h-8 flex items-center justify-center">
          <div className="w-24 h-1 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
