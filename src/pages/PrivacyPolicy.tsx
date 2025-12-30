import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: December 13, 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              SpireTrack ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our team productivity platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using SpireTrack, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">2.1 Account Information</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Email address</li>
              <li>Username and display name</li>
              <li>Profile picture (optional)</li>
              <li>Authentication credentials</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2">2.2 Usage Data</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Weekly review submissions and responses</li>
              <li>Team membership and role information</li>
              <li>Chat messages and file attachments within teams</li>
              <li>Calendar events and reminders</li>
              <li>Application usage patterns and preferences</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2">2.3 Technical Data</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Access timestamps</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use collected information to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Provide, operate, and maintain the SpireTrack platform</li>
              <li>Generate AI-powered productivity insights and reports</li>
              <li>Facilitate team collaboration and communication</li>
              <li>Send transactional notifications (team invites, reminders, mentions)</li>
              <li>Improve and personalize user experience</li>
              <li>Ensure platform security and prevent abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data is stored securely using industry-standard encryption and security practices. We use Supabase as our backend infrastructure provider, which implements:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>End-to-end encryption for data in transit</li>
              <li>Encryption at rest for stored data</li>
              <li>Row-level security policies</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share data only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Within your team:</strong> Team members and admins can view shared content as permitted by role settings</li>
              <li><strong>Service providers:</strong> Third-party services that help us operate (e.g., email delivery, AI processing)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use essential cookies to maintain your session and preferences. We do not use third-party advertising cookies or invasive tracking technologies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. Upon account deletion, your personal data will be removed within 30 days, except where retention is required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or your data, please contact us through the application's support channels.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex gap-6 text-sm">
            <Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link>
            <Link to="/" className="text-gray-600 hover:text-gray-900">Back to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
