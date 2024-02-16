import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import './App.scss';
import { useState } from 'react';
import store from 'data/store/createStore';
import { FocusStyleManager } from '@blueprintjs/core';
import TenstorrentLogo from '../main/assets/TenstorrentLogo';
import { ClusterDataSource } from '../data/DataSource';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';
import TopHeaderComponent from './components/TopHeaderComponent';
import useKeyboardFocus from './hooks/useKeyboardFocus.hook';
import Cluster from '../data/Cluster';
import { ChipProvider } from '../data/ChipDataProvider';

export default function App() {
    useKeyboardFocus();
    // @ts-ignore

    const [cluster, setCluster] = useState<Cluster | null>(null);

    FocusStyleManager.onlyShowFocusOnTabs();
    return (
        <Provider store={store}>
            {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
            <ClusterDataSource.Provider value={{ cluster, setCluster }}>
                <ChipProvider>
                    <Router>
                        <div className='header'>
                            <TenstorrentLogo />
                            <TopHeaderComponent />
                        </div>
                        <Routes>
                            <Route path='/' element={<SplashScreen />} />
                            <Route path='/render' element={<MainRouteRenderer />} />
                        </Routes>
                    </Router>
                </ChipProvider>
            </ClusterDataSource.Provider>
        </Provider>
    );
}
