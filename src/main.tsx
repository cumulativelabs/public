import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/home-foundation.css';
import './styles/home-story.css';
import './styles/home-systems.css';
import './styles/home-closing.css';
import './styles/home-responsive.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
