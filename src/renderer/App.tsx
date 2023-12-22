import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import './App.scss';
import { useMemo, useState } from 'react';
import store from 'data/store/createStore';

import { FocusStyleManager } from '@blueprintjs/core';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import DataSource, { GridContext } from '../data/DataSource';
import Chip from '../data/Chip';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';
import TopHeaderComponent from './components/TopHeaderComponent';
import useKeyboardFocus from './hooks/useKeyboardFocus.hook';

export default function App() {
    useKeyboardFocus();
    // @ts-ignore
    const [chip, setChip] = useState<Chip>(null);
    const memoizedChip = useMemo<GridContext>(() => ({ chip, setChip }), [chip]);
    FocusStyleManager.onlyShowFocusOnTabs();
    return (
        <Provider store={store}>
            <DataSource.Provider value={memoizedChip}>
                <Router>
                    <div className='header'>
                        <TenstorrentLogo />
                        <TopHeaderComponent />
                    </div>
                    <Routes>
                        <Route path='/' element={<SplashScreen />} />
                        <Route path='/render' element={<MainRouteRenderer updateData={setChip} />} />
                    </Routes>
                </Router>
            </DataSource.Provider>
        </Provider>
    );
}
