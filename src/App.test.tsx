import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import React from 'react';

// Mock Auth Context
vi.mock('./context/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAuth: () => ({
        user: { id: 'test-user', user_metadata: { full_name: 'Test User' } },
        loading: false,
        signOut: vi.fn()
    })
}));

// Mock Supabase for data fetching
vi.mock('./lib/supabase', () => ({
    supabase: {
        from: () => ({
            select: () => ({
                eq: () => ({
                    eq: () => ({
                        order: () => ({
                            limit: () => ({
                                single: vi.fn().mockResolvedValue({ data: [], error: null })
                            })
                        }),
                        single: vi.fn().mockResolvedValue({ data: [], error: null })
                    }),
                    single: vi.fn().mockResolvedValue({ data: [], error: null })
                }),
                single: vi.fn().mockResolvedValue({ data: [], error: null })
            }),
            insert: vi.fn().mockReturnValue({ select: () => ({ single: vi.fn() }) }),
            update: vi.fn().mockReturnValue({ eq: () => ({}) }),
            delete: vi.fn().mockReturnValue({ eq: () => ({}) })
        }),
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
        }
    }
}));

describe('App Integration Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the dashboard for authenticated user', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
        });
    });

    it('navigates to review wizard', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.getByText(/Start Weekly Review/i)).toBeInTheDocument();
        });

        const startButton = screen.getByText(/Start Weekly Review/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText(/Weekly Review/i)).toBeInTheDocument();
        });
    });
});
