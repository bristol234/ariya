import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, ChevronDown } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, position }) => {
  const [username, setUsername] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // Navigate to our login page with prefilled username
      navigate(`/login?username=${encodeURIComponent(username)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: position.y,
        right: position.x,
        minWidth: '320px'
      }}
    >
      {/* Header */}
      <div className="bg-[#002C5F] text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Digital Banking</h2>
      </div>

      {/* Login Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="relative">
            <div className="flex items-center border border-[#BE9B4C] rounded-lg px-3 py-3 bg-white">
              <User size={20} className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                required
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <Key size={16} className="text-gray-400" />
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-[#002C5F] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#003d99] transition-colors"
          >
            Continue
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a
              href="/login"
              className="text-[#002C5F] hover:text-[#003d99] text-sm font-medium"
            >
              Forgot username or password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal; 