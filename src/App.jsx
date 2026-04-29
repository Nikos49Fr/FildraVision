import { Routes, Route, Navigate } from 'react-router';
import Header from './layout/Header/Header';
import Home from './layout/Home/Home';
import Singers from './layout/Singers/Singers';
import Vote from './layout/Vote/Vote';
import Admin from './layout/Admin/Admin';
import AuthWidget from './components/AuthWidget/AuthWidget';
import { useProfile } from './context/profileContext';

export default function App() {
    const profile = useProfile();

    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/singers" element={<Singers />} />
                <Route path="/vote" element={<Vote />} />
                <Route
                    path="/admin"
                    element={
                        profile?.is_admin ? (
                            <Admin />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
                <Route path="*" element={<Home />} />
            </Routes>
            <AuthWidget />
        </>
    );
}
