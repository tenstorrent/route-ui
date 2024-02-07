import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import './App.scss';
import { useMemo, useState } from 'react';
import store from 'data/store/createStore';

import { FocusStyleManager } from '@blueprintjs/core';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import DataSource, { ClusterDataSource, GridContext } from '../data/DataSource';
import Chip from '../data/Chip';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';
import TopHeaderComponent from './components/TopHeaderComponent';
import useKeyboardFocus from './hooks/useKeyboardFocus.hook';
import { generateRuntimeData } from '../main/util';
import Cluster from '../data/Cluster';

export default function App() {
    useKeyboardFocus();
    // @ts-ignore
    const [chip, setChip] = useState<Chip>(null);
    const memoizedChip = useMemo<GridContext>(() => ({ chip, setChip }), [chip]);

    const [cluster, setCluster] = useState<Cluster | null>(null);

    FocusStyleManager.onlyShowFocusOnTabs();
    return (
        <Provider store={store}>
            <ClusterDataSource.Provider value={{ cluster, setCluster }}>
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
            </ClusterDataSource.Provider>
        </Provider>
    );
}
