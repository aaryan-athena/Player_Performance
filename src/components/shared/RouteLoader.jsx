import { LoadingSpinner } from './index.js';

/**
 * RouteLoader component for displaying loading states during route transitions
 * Requirements: 1.7 - Loading states during route transitions
 */
const RouteLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default RouteLoader;