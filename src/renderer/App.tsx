import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import { useState } from 'react';
import FileLoader from '../main/FileLoader';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import MainRouteRenderer from './MainRouteRenderer';
import DataSource from '../data/DataSource';
import SVGData from '../data/DataStructures';

function SplashScreen() {

    return (
        <>

            <div className="splash-screen">

                <FileLoader />

            </div>
        </>
    );
}

export default function App() {
    // eslint-disable-next-line no-use-before-define
    const [svgData, setSvgData] = useState(new SVGData({ nodes: [] }));

    return (
        <>
            <div className="Hello">
                <TenstorrentLogo />
            </div>
            {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
            <DataSource.Provider value={{ svgData, setSvgData }}>
                <Router>
                    <Routes>
                        <Route path="/" element={<SplashScreen />} />
                        <Route path="/render" element={<MainRouteRenderer />} />
                    </Routes>
                </Router>
            </DataSource.Provider>
        </>
    );
}
