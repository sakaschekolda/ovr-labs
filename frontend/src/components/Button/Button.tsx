import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  variant?: 'primary' | 'secondary';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  primary, 
  variant = 'primary',
  className = '', 
  onClick,
  ...props 
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  const buttonClass = `button ${primary ? 'button-primary' : ''} ${variant === 'secondary' ? 'button-secondary' : ''} ${className}`.trim();

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 