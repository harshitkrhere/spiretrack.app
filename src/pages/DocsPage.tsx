import React from 'react';
import { 
    BookOpenIcon, ClipboardDocumentListIcon, ChatBubbleLeftRightIcon, 
    DocumentChartBarIcon, CalendarDaysIcon, UserGroupIcon
} from '@heroicons/react/24/outline';

interface DocSection {
    id: string;
    title: string;
    icon: React.ForwardRefExoticComponent<any>;
    content: React.ReactNode;
}

const sections: DocSection[] = [
    {
        id: 'reviews',
        title: 'Weekly Reviews',
        icon: ClipboardDocumentListIcon,
        content: (
            <div className="space-y-4">
                <p>Weekly reviews are the core of SpireTrack's productivity tracking. Each week, you reflect on your work, mood, and progress.</p>
                
                <h4 className="font-semibold text-slate-900">How it works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-600">
                    <li>Navigate to <strong>Review</strong> from the sidebar on Sunday or Monday</li>
                    <li>Answer questions about your focus, accomplishments, challenges, and mood</li>
                    <li>Submit your review before the weekly deadline</li>
                    <li>AI analyzes your responses and generates personalized insights</li>
                </ol>

                <h4 className="font-semibold text-slate-900 mt-6">For Teams:</h4>
                <p className="text-slate-600">
                    Team admins can create custom review forms with specific questions. When you're part of a team, 
                    you may see additional team-specific questions in your weekly review.
                </p>
            </div>
        )
    },
    {
        id: 'reports',
        title: 'AI-Powered Reports',
        icon: DocumentChartBarIcon,
        content: (
            <div className="space-y-4">
                <p>After you complete a weekly review, SpireTrack's AI generates a personalized report with insights and recommendations.</p>
                
                <h4 className="font-semibold text-slate-900">Individual Reports include:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Summary</strong> — A narrative overview of your week</li>
                    <li><strong>Scores</strong> — Focus, mood, stress, and sleep ratings (1-10)</li>
                    <li><strong>Fix Plan</strong> — Actionable suggestions for improvement</li>
                    <li><strong>Blockers</strong> — Identified obstacles from your responses</li>
                    <li><strong>Call-out</strong> — A motivational or important highlight</li>
                </ul>

                <h4 className="font-semibold text-slate-900 mt-6">Team Consolidated Reports:</h4>
                <p className="text-slate-600">
                    Team admins can generate consolidated reports that aggregate all team members' submissions. 
                    These show team-wide trends, common challenges, and aggregate metrics while preserving individual privacy.
                </p>
            </div>
        )
    },
    {
        id: 'chat',
        title: 'Team Chat & Threads',
        icon: ChatBubbleLeftRightIcon,
        content: (
            <div className="space-y-4">
                <p>SpireTrack includes a built-in team chat system for async communication.</p>
                
                <h4 className="font-semibold text-slate-900">Channels:</h4>
                <p className="text-slate-600">
                    Each team has channels for organizing conversations. The default <code>#general</code> channel 
                    is created automatically. Admins can create additional channels for specific topics.
                </p>

                <h4 className="font-semibold text-slate-900 mt-6">Threads:</h4>
                <p className="text-slate-600">
                    Click on any message to start a thread. Threads keep discussions organized and prevent 
                    the main channel from getting cluttered. Thread replies appear in a side panel.
                </p>

                <h4 className="font-semibold text-slate-900 mt-6">Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Reactions</strong> — Add emoji reactions to messages</li>
                    <li><strong>Mentions</strong> — Use @username to notify someone</li>
                    <li><strong>Pins</strong> — Admins can pin important messages</li>
                    <li><strong>File attachments</strong> — Share images and files</li>
                    <li><strong>Search</strong> — Find messages quickly</li>
                </ul>
            </div>
        )
    },
    {
        id: 'teams',
        title: 'Team Management',
        icon: UserGroupIcon,
        content: (
            <div className="space-y-4">
                <p>Teams are collaborative workspaces where members can share reviews, chat, and track progress together.</p>
                
                <h4 className="font-semibold text-slate-900">Roles:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Owner</strong> — Full control over the team, cannot be removed</li>
                    <li><strong>Admin</strong> — Can manage members, roles, settings, and generate reports</li>
                    <li><strong>Member</strong> — Can participate in reviews, chat, and view reports</li>
                </ul>

                <h4 className="font-semibold text-slate-900 mt-6">Access Control:</h4>
                <p className="text-slate-600">
                    Admins can enable <strong>whitelist mode</strong> to restrict who can join the team. 
                    Only pre-approved usernames or registered users on the whitelist can join.
                </p>

                <h4 className="font-semibold text-slate-900 mt-6">Custom Forms:</h4>
                <p className="text-slate-600">
                    Team admins can create custom review forms with specific questions tailored to the team's needs. 
                    These forms appear alongside the standard weekly review questions.
                </p>
            </div>
        )
    },
    {
        id: 'calendar',
        title: 'Calendar & Reminders',
        icon: CalendarDaysIcon,
        content: (
            <div className="space-y-4">
                <p>The Calendar helps you track events, deadlines, and review submissions over time.</p>
                
                <h4 className="font-semibold text-slate-900">Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>View events by month with a clean calendar interface</li>
                    <li>Add personal events with titles, descriptions, and locations</li>
                    <li>See when weekly reviews are due</li>
                    <li>Set reminders for important tasks</li>
                </ul>

                <h4 className="font-semibold text-slate-900 mt-6">Reminders:</h4>
                <p className="text-slate-600">
                    Configure your reminder preferences in <strong>Settings</strong>. You can set your preferred 
                    time to receive email reminders for weekly reviews. Reminders are sent on Sundays by default.
                </p>
            </div>
        )
    }
];

export const DocsPage: React.FC = () => {
    const [activeSection, setActiveSection] = React.useState('reviews');

    const currentSection = sections.find(s => s.id === activeSection) || sections[0];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpenIcon className="h-7 w-7 text-green-600" />
                        <h1 className="text-2xl font-bold text-slate-900">Documentation</h1>
                    </div>
                    <p className="text-slate-600">
                        Learn how SpireTrack works and get the most out of the platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-8">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                                Topics
                            </h3>
                            <ul className="space-y-1">
                                {sections.map(section => (
                                    <li key={section.id}>
                                        <button
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors ${
                                                activeSection === section.id
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <section.icon className="h-5 w-5 flex-shrink-0" />
                                            {section.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </nav>

                    {/* Content Area */}
                    <main className="lg:col-span-3">
                        <div className="bg-white rounded-xl border border-gray-200 p-8">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                                    <currentSection.icon className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {currentSection.title}
                                </h2>
                            </div>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                {currentSection.content}
                            </div>
                        </div>

                        {/* Help Footer */}
                        <div className="mt-6 p-6 bg-slate-100 rounded-xl text-center">
                            <p className="text-slate-600">
                                Need more help? Reach out through your team's admin or check Settings for support options.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DocsPage;
