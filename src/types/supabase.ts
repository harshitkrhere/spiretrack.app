export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    timezone: string
                    language: 'en' | 'hin'
                    reminder_day: string
                    reminder_time: string
                    plan: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    timezone?: string
                    language?: 'en' | 'hin'
                    reminder_day?: string
                    reminder_time?: string
                    plan?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    timezone?: string
                    language?: 'en' | 'hin'
                    reminder_day?: string
                    reminder_time?: string
                    plan?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            weekly_reviews: {
                Row: {
                    id: string
                    user_id: string
                    week_start_date: string
                    status: 'draft' | 'completed'
                    answers: Json
                    ai_output: Json | null
                    scores: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    week_start_date: string
                    status?: 'draft' | 'completed'
                    answers?: Json
                    ai_output?: Json | null
                    scores?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    week_start_date?: string
                    status?: 'draft' | 'completed'
                    answers?: Json
                    ai_output?: Json | null
                    scores?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            daily_checkins: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    mood_score: number | null
                    notes: string | null
                    completed_tasks: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    mood_score?: number | null
                    notes?: string | null
                    completed_tasks?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    mood_score?: number | null
                    notes?: string | null
                    completed_tasks?: Json
                    created_at?: string
                }
            }
            settings: {
                Row: {
                    user_id: string
                    email_reminders_enabled: boolean
                    theme_preference: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    email_reminders_enabled?: boolean
                    theme_preference?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    email_reminders_enabled?: boolean
                    theme_preference?: string
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
