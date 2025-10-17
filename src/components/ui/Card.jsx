import React from 'react';

/**
 * Reusable Card component with different variants
 */
const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'md', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl border transition-all duration-200';
  
  const variants = {
    default: 'border-gray-200 shadow-sm hover:shadow-md',
    elevated: 'border-gray-200 shadow-lg hover:shadow-xl',
    outlined: 'border-2 border-gray-300 shadow-none hover:border-gray-400',
    gradient: 'border-0 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm hover:shadow-md'
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Header component
 */
const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Title component
 */
const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

/**
 * Card Content component
 */
const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Footer component
 */
const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;