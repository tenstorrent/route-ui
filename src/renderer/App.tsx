import { FocusStyleManager } from '@blueprintjs/core';
import store from 'data/store/createStore';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { ChipProvider } from '../data/ChipDataProvider';
import Cluster from '../data/Cluster';
import { ClusterDataSource } from '../data/DataSource';
import './App.scss';
import MainRouteRenderer from './MainRouteRenderer';
import SplashScreen from './SplashScreen';
import useKeyboardFocus from './hooks/useKeyboardFocus.hook';

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
