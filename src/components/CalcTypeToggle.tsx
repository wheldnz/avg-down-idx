import React from 'react';
import { Calculator, Target, Briefcase } from 'lucide-react';

interface CalcTypeToggleProps {
  calcType: 'regular' | 'target' | 'right-issue';
  onTypeChange: (type: 'regular' | 'target' | 'right-issue') => void;
}

export const CalcTypeToggle: React.FC<CalcTypeToggleProps> = ({ calcType, onTypeChange }) => {
  return (
    <div className="nav-tabs-wrapper">
      <div className="container">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${calcType === 'regular' ? 'active' : ''}`}
            onClick={() => onTypeChange('regular')}
          >
            <Calculator size={18} /> Kalkulator Standar
          </button>
          <button 
            className={`nav-tab ${calcType === 'target' ? 'active' : ''}`}
            onClick={() => onTypeChange('target')}
          >
            <Target size={18} /> Target Average
          </button>
          <button 
            className={`nav-tab ${calcType === 'right-issue' ? 'active' : ''}`}
            onClick={() => onTypeChange('right-issue')}
          >
            <Briefcase size={18} /> Right Issue
          </button>
        </div>
      </div>
    </div>
  );
};
