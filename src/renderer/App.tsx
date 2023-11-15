import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import './App.scss';
import { useMemo, useState } from 'react';
import store from 'data/store/createStore';

import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import DataSource, { GridContext } from '../data/DataSource';
import Chip from '../data/Chip';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';
import TopHeaderComponent from './components/TopHeaderComponent';

export default function App() {
    // @ts-ignore
    const [chip, setChip] = useState<Chip>(null);
    const memoizedChip = useMemo<GridContext>(() => ({ chip, setChip }), [chip]);
    return (
        <Provider store={store}>
            <div className='header'>
                <TenstorrentLogo />
                <TopHeaderComponent />
            </div>
            <DataSource.Provider value={memoizedChip}>
                <Router>
                    <Routes>
                        <Route path='/' element={<SplashScreen updateChip={setChip} />} />
                        <Route path='/render' element={<MainRouteRenderer updateData={setChip} />} />
                    </Routes>
                </Router>
            </DataSource.Provider>
        </Provider>
    );
}
