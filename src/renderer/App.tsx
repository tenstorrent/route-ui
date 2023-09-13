import {MemoryRouter as Router, Routes, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import './App.scss';
import {useState} from 'react';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import DataSource from '../data/DataSource';
import GridData from '../data/DataStructures';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';
import store from '../data/store';
import {NetlistAnalyzerDataJSON} from '../data/JSONDataTypes';
import TopHeaderComponent from './components/TopHeaderComponent';

export default function App() {
    const [gridData, setGridData] = useState<GridData>(null);


    return (
        <Provider store={store}>
            <div className="header">
                <TenstorrentLogo />
                <TopHeaderComponent />
            </div>
            <DataSource.Provider value={{gridData}}>
                <Router>
                    <Routes>
                        <Route path="/" element={<SplashScreen updateData={setGridData} />} />
                        <Route path="/render" element={<MainRouteRenderer updateData={setGridData} />} />
                    </Routes>
                </Router>
            </DataSource.Provider>
        </Provider>
    );
}
