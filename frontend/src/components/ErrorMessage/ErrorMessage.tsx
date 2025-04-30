import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  code?: number;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, code }) => {
  return (
    <div className="error-message">
      {code && <span className="error-code">Error {code}: </span>}
      <span className="error-text">{message}</span>
    </div>
  );
};

export default ErrorMessage; 