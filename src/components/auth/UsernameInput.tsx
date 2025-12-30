import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Input } from '../ui/Input';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
  currentUsername?: string; // To allow keeping current username
  className?: string;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({ 
  value, 
  onChange, 
  onValidityChange, 
  currentUsername,
  className 
}) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [message, setMessage] = useState<string>('');

  // Debounce check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        validateAndCheck(value);
      } else {
        setStatus('idle');
        setMessage('');
        onValidityChange(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  const validateAndCheck = async (username: string) => {
    // 1. Basic Format Check (Client-side)
    const lower = username.toLowerCase();
    const regex = /^[a-z0-9._]{3,30}$/;
    
    if (!regex.test(lower)) {
      setStatus('invalid');
      setMessage('3-30 chars, letters, numbers, dots, underscores only.');
      onValidityChange(false);
      return;
    }
    
    if (lower.includes('..') || lower.includes('__')) {
        setStatus('invalid');
        setMessage('No consecutive dots or underscores.');
        onValidityChange(false);
        return;
    }

    if (currentUsername && lower === currentUsername.toLowerCase()) {
        setStatus('valid');
        setMessage('This is your current username.');
        onValidityChange(true);
        return;
    }

    // 2. Availability Check (Server-side)
    setStatus('checking');
    try {
      const { data, error } = await supabase.functions.invoke('user-profile-operations', {
        body: { action: 'check_availability', username: lower }
      });

      if (error) throw error;

      if (data.available) {
        setStatus('valid');
        setMessage('Username is available!');
        onValidityChange(true);
      } else {
        setStatus('invalid');
        setMessage(data.error || 'This username is already taken. Please choose another.');
        onValidityChange(false);
      }
    } catch (err) {
      console.error('Check failed:', err);
      setStatus('invalid');
      setMessage('Error checking availability.');
      onValidityChange(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''); // Force lowercase & valid chars
    onChange(val);
    setStatus('idle'); // Reset status while typing
    onValidityChange(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Username
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500">@</span>
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className={`block w-full pl-8 pr-10 py-2 sm:text-sm rounded-md border-slate-300 focus:ring-primary-500 focus:border-primary-500 ${
            status === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' :
            status === 'valid' ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''
          }`}
          placeholder="username"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {status === 'checking' && (
            <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
          )}
          {status === 'valid' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
          {status === 'invalid' && <XCircleIcon className="h-5 w-5 text-red-500" />}
        </div>
      </div>
      {message && (
        <p className={`mt-1 text-xs ${
          status === 'valid' ? 'text-green-600' : 
          status === 'invalid' ? 'text-red-600' : 'text-slate-500'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};
