import React from 'react';
import { Calculator, Target } from 'lucide-react';

interface CalcTypeToggleProps {
  calcType: 'regular' | 'target';
  onTypeChange: (type: 'regular' | 'target') => void;
}

export const CalcTypeToggle: React.FC<CalcTypeToggleProps> = ({ calcType, onTypeChange }) => {
  return (
    <div className="calc-type-toggle">
      <div className="container" style={{ padding: '0.5rem 1rem' }}>
        <div className="mode-toggle" style={{ marginBottom: '0.5rem' }}>
          <button 
            className={`mode-toggle-btn ${calcType === 'regular' ? 'active' : ''}`}
            onClick={() => onTypeChange('regular')}
          >
            <Calculator size={18} /> Kalkulator Standar
          </button>
          <button 
            className={`mode-toggle-btn ${calcType === 'target' ? 'active' : ''}`}
            onClick={() => onTypeChange('target')}
          >
            <Target size={18} /> Target Average
          </button>
        </div>
      </div>
    </div>
  );
};
