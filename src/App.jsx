import { Routes, Route } from 'react-router';
import Header from './layout/Header/Header';
import Home from './layout/Home/Home';
import Singers from './layout/Singers/Singers';
import Vote from './layout/Vote/Vote';
import AuthWidget from './components/AuthWidget/AuthWidget';

export default function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/singers" element={<Singers />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="*" element={<Home />} />
            </Routes>
            <AuthWidget />
        </>
    );
}
