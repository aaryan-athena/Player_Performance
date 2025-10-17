import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * Various loading state components for different scenarios
 * Requirements: 7.5, 8.4 - Loading states for async operations
 */

// Full page loading overlay
export const PageLoader = ({ message = "Loading...", transparent = false }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${
    transparent ? 'bg-white bg-opacity-75' : 'bg-gray-50'
  }`}>
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Route-level loading component
export const RouteLoader = ({ message = "Loading page..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-3 text-gray-600">{message}</p>
    </div>
  </div>
);

// Component-level loading overlay
export const ComponentLoader = ({ message = "Loading...", className = "" }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <div className="text-center">
      <LoadingSpinner size="md" />
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  </div>
);

// Inline loading for buttons and small components
export const InlineLoader = ({ message = "Loading...", size = "sm" }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size={size} />
    <span className="text-sm text-gray-600">{message}</span>
  </div>
);

// Button loading state
export const ButtonLoader = ({ size = "sm", color = "white" }) => (
  <LoadingSpinner size={size} color={color} />
);

// Table/List loading skeleton
export const SkeletonLoader = ({ rows = 3, className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Card loading skeleton
export const CardSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-white rounded-lg shadow p-6 ${className}`}>
    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// Form loading overlay
export const FormLoader = ({ message = "Submitting..." }) => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
    <div className="text-center">
      <LoadingSpinner size="md" />
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  </div>
);

export default {
  PageLoader,
  RouteLoader,
  ComponentLoader,
  InlineLoader,
  ButtonLoader,
  SkeletonLoader,
  CardSkeleton,
  FormLoader
};