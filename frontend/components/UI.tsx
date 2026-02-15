import React, { Fragment, ReactNode } from 'react';
import { LucideIcon, X } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', isLoading, icon: Icon, className = '', disabled, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-900/20 focus:ring-blue-500",
    secondary: "bg-[#272733] hover:bg-[#323242] text-gray-200 border border-white/5 focus:ring-gray-500",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
    <input
      className={`w-full bg-[#111118] border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);

// --- Card ---
export const Card: React.FC<{ children: ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-[#16161f] border border-white/5 rounded-xl p-6 shadow-xl backdrop-blur-sm ${onClick ? 'cursor-pointer hover:border-blue-500/30 transition-colors' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#16161f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Spinner ---
export const PageSpinner = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-400 text-sm animate-pulse">Loading...</p>
  </div>
);

// --- Badge ---
export const Badge: React.FC<{ children: ReactNode; variant?: 'success' | 'warning' | 'neutral' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${styles[variant]} font-medium`}>
      {children}
    </span>
  );
};