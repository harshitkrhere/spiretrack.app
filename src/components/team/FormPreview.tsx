import React from 'react';

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
    const inputClass = "w-full px-3 py-2.5 bg-[#f5f5f7] border border-[#e5e5e7] rounded-lg text-[15px] text-[#aeaeb2]";
    
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
            className={inputClass + " max-w-[120px]"}
          />
        );
      case 'rating':
        return (
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <div
                key={num}
                className="w-8 h-8 flex items-center justify-center bg-[#f5f5f7] border border-[#e5e5e7] rounded-lg text-[13px] text-[#aeaeb2]"
              >
                {num}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e7] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e5e5e7] bg-[#f5f5f7]">
        <p className="text-[13px] text-[#86868b]">
          Member view
        </p>
      </div>

      {/* Preview Content */}
      <div className="p-5">
        {questions.length === 0 ? (
          <p className="text-[15px] text-[#aeaeb2] text-center py-8">
            Add questions to see preview
          </p>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index}>
                <label className="block text-[15px] text-[#1d1d1f] mb-2">
                  <span className="text-[#86868b] mr-1.5">{index + 1}.</span>
                  {question.question_text || 'Untitled question'}
                  {question.is_required && (
                    <span className="text-[#86868b] text-[13px] ml-1">*</span>
                  )}
                </label>
                {renderQuestionPreview(question)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
