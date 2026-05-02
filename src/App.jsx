import { Routes, Route } from 'react-router';
import Header from './layout/Header/Header';
import Home from './layout/Home/Home';
import Singers from './layout/Singers/Singers';
import Vote from './layout/Vote/Vote';
import Admin from './layout/Admin/Admin';
import AuthWidget from './components/AuthWidget/AuthWidget';
import { ProtectedAdminRoute } from './utils/ProtectedAdminRoute/ProtectedAdminRoute';

export default function App() {
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
                        <ProtectedAdminRoute>
                            <Admin />
                        </ProtectedAdminRoute>
                    }
                />
                <Route path="*" element={<Home />} />
            </Routes>
            <AuthWidget />
        </>
    );
}
