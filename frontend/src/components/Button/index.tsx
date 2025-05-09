import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button = ({ 
  children, 
  primary, 
  variant = 'primary',
  className = '', 
  ...props 
}: ButtonProps) => {
  const buttonClass = `button ${primary ? 'button-primary' : ''} ${variant === 'secondary' ? 'button-secondary' : ''} ${className}`.trim();

  return (
    <button
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 