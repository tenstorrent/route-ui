import { FocusStyleManager } from '@blueprintjs/core';
import store from 'data/store/createStore';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { GraphOnChipProvider } from '../data/GraphOnChipDataProvider';
import Cluster from '../data/Cluster';
import { ClusterDataSource } from '../data/DataSource';
import useKeyboardFocus from './hooks/useKeyboardFocus.hook';
import MainRouteRenderer from './views/MainRouteRenderer';
import SplashScreen from './views/SplashScreen';

import './scss/App.scss';

export default function App() {
    useKeyboardFocus();
    // @ts-ignore

    const [cluster, setCluster] = useState<Cluster | null>(null);

    FocusStyleManager.onlyShowFocusOnTabs();
    return (
        <Provider store={store}>
            {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
            <ClusterDataSource.Provider value={{ cluster, setCluster }}>
                <GraphOnChipProvider>
                    <Router>
                        <Routes>
                            <Route path='/' element={<SplashScreen />} />
                            <Route path='/render' element={<MainRouteRenderer />} />
                        </Routes>
                    </Router>
                </GraphOnChipProvider>
            </ClusterDataSource.Provider>
        </Provider>
    );
}
