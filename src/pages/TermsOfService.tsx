import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const TermsOfService: React.FC = () => {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: December 13, 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using SpireTrack ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These Terms apply to all users of the Service, including individual users, team administrators, and organizational accounts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              SpireTrack is a team productivity and collaboration platform that provides weekly review tracking, AI-powered analytics, team communication, and workflow management tools. The Service is designed for professional use by teams, organizations, and individual knowledge workers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 Registration</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 Account Security</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use or security breach.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-2">3.3 Age Requirement</h3>
            <p className="text-gray-700 leading-relaxed">
              You must be at least 18 years old to use this Service, or have the consent of a parent or legal guardian.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Collect user data without consent</li>
              <li>Use the Service to send spam or unsolicited messages</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. User Content</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">5.1 Ownership</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of all content you create, upload, or share through the Service ("User Content"). By using the Service, you grant us a limited license to store, display, and process your content as necessary to provide the Service.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mb-2">5.2 Responsibility</h3>
            <p className="text-gray-700 leading-relaxed">
              You are solely responsible for your User Content. We do not endorse any User Content and are not liable for content created by users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Team and Organization Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When using SpireTrack as part of a team or organization:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Team administrators may have access to team-level data and reports</li>
              <li>Your organization may have policies that govern your use of the Service</li>
              <li>Content shared within teams is visible to team members according to role permissions</li>
              <li>Team administrators can manage membership, roles, and access controls</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. AI-Generated Content</h2>
            <p className="text-gray-700 leading-relaxed">
              SpireTrack uses AI to generate reports, insights, and recommendations. AI-generated content is provided for informational purposes only and should not be considered professional advice. We do not guarantee the accuracy, completeness, or usefulness of AI-generated content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may modify, suspend, or discontinue any part of the Service at any time with or without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
              <li>Our total liability shall not exceed the amount paid by you for the Service in the past 12 months</li>
              <li>We are not responsible for third-party services or integrations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless SpireTrack, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account at any time for violation of these Terms or for any other reason at our discretion. Upon termination:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Your right to use the Service will immediately cease</li>
              <li>You may request export of your data before termination</li>
              <li>Provisions that by their nature should survive will remain in effect</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting a notice on the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms, please contact us through the application's support channels.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link>
            <Link to="/" className="text-gray-600 hover:text-gray-900">Back to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
