import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Global styles from legacy structure
import './assets/css/variables.css'
import './assets/css/base.css'
import './assets/css/components.css'
import './assets/css/layout.css'
import './assets/css/animations.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
