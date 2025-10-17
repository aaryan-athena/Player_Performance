import { Suspense } from 'react';
import { RouteLoader } from './index.js';

/**
 * RouteWrapper component for handling route-level loading states
 * Requirements: 1.7 - Loading states during route transitions
 */
const RouteWrapper = ({ children, fallback = null }) => {
  return (
    <Suspense fallback={fallback || <RouteLoader message="Loading page..." />}>
      {children}
    </Suspense>
  );
};

export default RouteWrapper;