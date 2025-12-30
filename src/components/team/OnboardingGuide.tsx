import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface OnboardingGuideProps {
  teamId: string;
  teamName: string;
  hasMembers: boolean;
  hasReviews: boolean;
  hasReports: boolean;
  isAdmin: boolean;
}

interface StepProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  link: string;
  linkText: string;
  complete: boolean;
  index: number;
}

const Step: React.FC<StepProps> = ({ icon: Icon, title, description, link, linkText, complete, index }) => (
  <div className={`relative flex items-start gap-4 p-4 rounded-xl transition-all ${complete ? 'bg-green-50' : 'bg-white border border-slate-200 hover:border-slate-300'}`}>
    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${complete ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
      {complete ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="font-semibold">{index}</span>
      )}
    </div>
    <div className="flex-1">
      <h4 className={`font-medium ${complete ? 'text-green-800' : 'text-slate-900'}`}>{title}</h4>
      <p className={`text-sm mt-0.5 ${complete ? 'text-green-600' : 'text-slate-500'}`}>{description}</p>
      {!complete && (
        <Link 
          to={link}
          className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {linkText}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  </div>
);

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  teamId,
  teamName,
  hasMembers,
  hasReviews,
  hasReports,
  isAdmin
}) => {
  const allComplete = hasMembers && hasReviews && hasReports;
  
  if (allComplete) return null;

  const steps = [
    {
      icon: UserGroupIcon,
      title: 'Invite team members',
      description: 'Share the team code or send invites to get your team on board',
      link: `/app/team/${teamId}/members`,
      linkText: 'Manage members',
      complete: hasMembers
    },
    {
      icon: DocumentTextIcon,
      title: 'Submit your first review',
      description: 'Fill out your weekly review to share progress and blockers',
      link: `/app/team/${teamId}/review`,
      linkText: 'Submit review',
      complete: hasReviews
    },
    ...(isAdmin ? [{
      icon: SparklesIcon,
      title: 'Generate AI report',
      description: 'Once members submit reviews, generate insights with AI',
      link: `/app/team/${teamId}`,
      linkText: 'View dashboard',
      complete: hasReports
    }] : [])
  ];

  const completedCount = steps.filter(s => s.complete).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Getting Started with {teamName}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {completedCount}/{steps.length} steps completed
          </p>
        </div>
        <div className="w-16 h-16 relative">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle 
              cx="32" cy="32" r="28" fill="none" 
              stroke="#22c55e" strokeWidth="6"
              strokeDasharray={`${progressPercent * 1.76} 176`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <Step key={step.title} {...step} index={index + 1} />
        ))}
      </div>
    </div>
  );
};
