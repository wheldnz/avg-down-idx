import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface ModeToggleProps {
  mode: 'down' | 'up';
  onModeChange: (mode: 'down' | 'up') => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div className="container">
      <div className="mode-toggle-wrapper">
        <div className="mode-toggle">
          <button 
            className={`mode-toggle-btn ${mode === 'down' ? 'active' : ''}`}
            onClick={() => onModeChange('down')}
          >
            <ArrowDown size={18} style={{ marginRight: '6px' }} /> Avg Down
          </button>
          <button 
            className={`mode-toggle-btn ${mode === 'up' ? 'active' : ''}`}
            onClick={() => onModeChange('up')}
          >
            <ArrowUp size={18} style={{ marginRight: '6px' }} /> Avg Up
          </button>
        </div>
      </div>
    </div>
  );
};
