import { Header } from './Header';
import { lazy, Suspense } from 'react';
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import('./home'));
const About = lazy(() => import('./about'));
const Contact = lazy(() => import('./contact'));
import './App.css';

const Loading = () => {
    return <span>Loading...</span>;
}
export const App = () => {
    return (
        <div className="container">
            <Header />
            <main>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="contact" element={<Contact />} />
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}