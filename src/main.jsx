import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import App from './App.jsx';
import './styles/index.scss';
import { ProfileProvider } from './context/profileContext';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HashRouter>
            <ProfileProvider>
                <App />
            </ProfileProvider>
        </HashRouter>
    </StrictMode>,
);
