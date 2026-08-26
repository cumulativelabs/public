import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/home-foundation.css';
import './styles/signal-field.css';
import './styles/master-foundation.css';
import './styles/master-story.css';
import './styles/master-work.css';
import './styles/master-closing.css';
import './styles/master-responsive.css';
import './styles/master-alignment.css';
import './styles/master-mobile-geometry.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
