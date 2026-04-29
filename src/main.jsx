import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import './styles/index.scss';
import { ProfileProvider } from './context/profileContext';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <ProfileProvider>
                <App />
            </ProfileProvider>
        </BrowserRouter>
    </StrictMode>,
);
