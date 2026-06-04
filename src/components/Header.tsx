import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className="header" id="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-logo">
            <div className="header-logo-icon">📊</div>
            <div>
              <div className="header-title">Avg Down <span>IDX</span></div>
              <div className="header-subtitle">Kalkulator Saham Indonesia</div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="theme-toggle" 
              id="theme-toggle" 
              aria-label="Toggle dark mode"
              onClick={onToggleTheme}
            >
              <span className="theme-toggle-thumb">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
