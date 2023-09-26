import {MemoryRouter as Router, Route, Routes} from 'react-router-dom';
import {Provider} from 'react-redux';
import './App.scss';
import {useState} from 'react';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import DataSource from '../data/DataSource';
import Chip from '../data/DataStructures';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';
import store from '../data/store';
import TopHeaderComponent from './components/TopHeaderComponent';

export default function App() {
    const [chip, setChip] = useState<Chip>(null);

    return (
        <Provider store={store}>
            <div className="header">
                <TenstorrentLogo />
                <TopHeaderComponent />
            </div>
            <DataSource.Provider value={{chip}}>
                <Router>
                    <Routes>
                        <Route path="/" element={<SplashScreen updateData={setChip} />} />
                        <Route path="/render" element={<MainRouteRenderer updateData={setChip} />} />
                    </Routes>
                </Router>
            </DataSource.Provider>
        </Provider>
    );
}
