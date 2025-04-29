import React from 'react';
import classNames from 'classnames';
import './styles.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: (e: React.FormEvent) => void | Promise<void>;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  className,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      className={classNames('button', `button--${variant}`, className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button; 