import {MemoryRouter as Router, Routes, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import './App.scss';
import {useState} from 'react';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import DataSource from '../data/DataSource';
import SVGData from '../data/DataStructures';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';
import store from '../data/store';
import {SVGJson} from '../data/JSONDataTypes';

export default function App() {
    // @ts-ignore
    const [svgData, setSvgData] = useState<SVGData>(new SVGData({nodes: []} as SVGJson));
    // @ts-ignore
    return (
        <>
            <div className="header">
                <TenstorrentLogo />
            </div>
            <Provider store={store}>
                {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
                <DataSource.Provider value={{svgData}}>
                    <Router>
                        <Routes>
                            <Route path="/" element={<SplashScreen updateData={setSvgData} />} />
                            <Route path="/render" element={<MainRouteRenderer />} />
                        </Routes>
                    </Router>
                </DataSource.Provider>
            </Provider>
        </>
    );
}
