import React from 'react';
import { Calculator, Target } from 'lucide-react';

interface CalcTypeToggleProps {
  calcType: 'regular' | 'target';
  onTypeChange: (type: 'regular' | 'target') => void;
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
        </div>
      </div>
    </div>
  );
};
