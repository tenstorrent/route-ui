import {MemoryRouter as Router, Routes, Route} from 'react-router-dom';
import './App.scss';
import {useState} from 'react';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import DataSource from '../data/DataSource';
import SVGData from '../data/DataStructures';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';

export default function App() {
    const [svgData, setSvgData] = useState<SVGData>(new SVGData({nodes: []}));
    return (
        <>
            <div className="header">
                <TenstorrentLogo />
            </div>
            {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
            <DataSource.Provider value={{svgData, setSvgData}}>
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
