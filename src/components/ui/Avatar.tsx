import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string; // Used for initials fallback
  email?: string; // Used for initials fallback if name is not available
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'banned';
  showStatus?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-slate-400',
  away: 'bg-yellow-500',
  banned: 'bg-red-600',
};

const statusSizes = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
};

/**
 * Avatar component with automatic fallback to initials when image fails to load.
 * Handles both missing avatar URLs and broken/invalid image URLs gracefully.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  email,
  size = 'md',
  className = '',
  status,
  showStatus = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate initials from name or email
  const getInitials = (): string => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  // Generate consistent background color based on name/email
  const getBackgroundColor = (): string => {
    const str = name || email || '';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const shouldShowImage = src && !imageError;
  const shouldShowInitials = !src || imageError;

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Avatar Container */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full overflow-hidden flex items-center justify-center font-semibold
          ${shouldShowInitials ? `${getBackgroundColor()} text-white` : 'bg-gray-200'}
        `}
      >
        {/* Image */}
        {shouldShowImage && (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Initials Fallback */}
        {shouldShowInitials && getInitials()}

        {/* Loading placeholder (behind image) */}
        {shouldShowImage && !imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
        )}
      </div>

      {/* Status Indicator */}
      {showStatus && status && (
        <div
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            rounded-full border-2 border-white
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
