import React from 'react';
import { ReviewWizard } from '../components/review/ReviewWizard';

const Review: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-[#F3F6F8] overflow-hidden flex items-center justify-center p-4">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#4A6F91] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 animate-blob" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#FF6B4A] rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/3 -translate-x-1/3 animate-blob animation-delay-2000" />

            <div className="relative w-full max-w-4xl z-10">
                <ReviewWizard />
            </div>
        </div>
    );
};

export default Review;
