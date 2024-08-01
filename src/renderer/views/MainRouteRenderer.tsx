// SPDX-License-Identifier: Apache-2.0
//
// SPDX-FileCopyrightText: © 2024 Tenstorrent AI ULC

import { getDetailedViewHeight, getIsLoadingFolder } from 'data/store/selectors/uiState.selectors';
import React from 'react';
import { useSelector } from 'react-redux';
import TenstorrentLogo from '../../main/assets/TenstorrentLogo';
import GridRender from '../components/GridRender';
import { SideBar } from '../components/SideBar';
import TopHeaderComponent from '../components/TopHeaderComponent';
import BottomDock from '../components/bottom-dock/BottomDock';
import { GridSidebar } from '../components/grid-sidebar/GridSidebar';
import PropertiesPanel from '../components/properties-panel/PropertiesPanel';
import usePerfAnalyzerFileLoader from '../hooks/usePerfAnalyzerFileLoader.hooks';
import './MainRouteRenderer.scss';

export interface MainRouteRendererProps {}

const MainRouteRenderer: React.FC<MainRouteRendererProps> = () => {
    const detailedViewHeight = useSelector(getDetailedViewHeight);
    const loading = useSelector(getIsLoadingFolder);
    const { error } = usePerfAnalyzerFileLoader();

    return (
        <div
            className={`main-route ${!loading && error ? 'invalid-data' : ''} ${loading ? 'loading-data' : ''}`}
            style={
                {
                    '--js-bottom-dock-height': `${detailedViewHeight}px`,
                } as React.CSSProperties
            }
        >
            <div className='header'>
                <TenstorrentLogo />
                <TopHeaderComponent />
            </div>
            <SideBar />
            <GridSidebar />
            <GridRender />
            <PropertiesPanel />
            <BottomDock />
            <div className='main-route-loading-overlay'>
                <p>Loading data...</p>
            </div>
        </div>
    );
};

export default MainRouteRenderer;
