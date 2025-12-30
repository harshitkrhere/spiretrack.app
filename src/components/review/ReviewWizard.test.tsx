import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewWizard } from './ReviewWizard';
import React from 'react';

// Mock Supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockInvoke = vi.fn();

vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: () => ({
            insert: mockInsert.mockReturnValue({
                select: () => ({
                    single: mockSelect
                })
            })
        }),
        functions: {
            invoke: mockInvoke
        }
    }
}));

// Mock Auth Context
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user-id' },
        loading: false
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('ReviewWizard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelect.mockResolvedValue({ data: { id: 'review-123' }, error: null });
        mockInvoke.mockResolvedValue({ data: { summary: 'Good job' }, error: null });
    });

    it('renders the first question', () => {
        render(<ReviewWizard />);
        expect(screen.getByText('What were your biggest wins this week?')).toBeInTheDocument();
    });

    it('disables Next button initially', () => {
        render(<ReviewWizard />);
        const nextButton = screen.getByText('Next');
        expect(nextButton).toBeDisabled();
    });

    it('enables Next button after typing', () => {
        render(<ReviewWizard />);
        const textarea = screen.getByPlaceholderText('I finally shipped that feature...');
        fireEvent.change(textarea, { target: { value: 'My big win' } });

        const nextButton = screen.getByText('Next');
        expect(nextButton).not.toBeDisabled();
    });

    it('advances to next question on click', () => {
        render(<ReviewWizard />);
        const textarea = screen.getByPlaceholderText('I finally shipped that feature...');
        fireEvent.change(textarea, { target: { value: 'My big win' } });

        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);

        expect(screen.getByText('What challenges did you face?')).toBeInTheDocument();
    });
});
